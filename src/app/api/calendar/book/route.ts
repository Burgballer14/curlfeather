import { NextRequest, NextResponse } from 'next/server';
import { calendarEngine } from '@/lib/calendar/calendar-engine';
import { sendLeadNotificationEmail } from '@/lib/automation/email';
import { sendLeadAlertSMS } from '@/lib/automation/sms';

/**
 * Book an appointment
 */
export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();

    // Validate required fields
    const requiredFields = [
      'customerName', 'customerEmail', 'customerPhone',
      'date', 'startTime', 'endTime', 'projectType', 'address'
    ];

    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(appointmentData.customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic check)
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(appointmentData.customerPhone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Book the appointment
    const bookingResult = calendarEngine.bookAppointment({
      customerName: appointmentData.customerName,
      customerEmail: appointmentData.customerEmail,
      customerPhone: appointmentData.customerPhone,
      date: appointmentData.date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      projectType: appointmentData.projectType,
      address: appointmentData.address,
      notes: appointmentData.notes || '',
      status: 'scheduled'
    });

    if (!bookingResult.success) {
      return NextResponse.json(
        { error: bookingResult.error },
        { status: 400 }
      );
    }

    const appointment = calendarEngine.getAppointment(bookingResult.appointmentId!);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Failed to retrieve booked appointment' },
        { status: 500 }
      );
    }

    // Send notifications
    try {
      // Send confirmation email to customer
      await sendLeadNotificationEmail({
        name: appointment.customerName,
        email: appointment.customerEmail,
        phone: appointment.customerPhone,
        address: appointment.address,
        projectType: appointment.projectType,
        estimatedCost: appointment.estimatedCost || 0,
        leadScore: 100, // Appointments are high priority
        projectDetails: {
          roomLength: 'N/A',
          roomWidth: 'N/A',
          ceilingHeight: 'N/A',
          timeline: `Appointment scheduled for ${appointment.date} at ${appointment.startTime}`,
          budget: 'To be discussed during estimate',
          services: { appointment_booking: true }
        }
      });

      // Send SMS alert to business
      await sendLeadAlertSMS({
        name: appointment.customerName,
        phone: appointment.customerPhone,
        email: appointment.customerEmail,
        estimatedCost: 0,
        leadScore: 100,
        projectType: appointment.projectType,
        timeline: `Appointment: ${appointment.date} at ${appointment.startTime}`
      });

      console.log(`Appointment booked: ${bookingResult.appointmentId} for ${appointment.customerName}`);

    } catch (notificationError) {
      console.error('Failed to send appointment notifications:', notificationError);
      // Don't fail the booking if notifications fail
    }

    return NextResponse.json({
      success: true,
      appointmentId: bookingResult.appointmentId,
      appointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        projectType: appointment.projectType,
        status: appointment.status
      },
      message: 'Appointment booked successfully'
    });

  } catch (error) {
    console.error('Appointment booking API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to book appointment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get appointment details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = calendarEngine.getAppointment(appointmentId);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        customerPhone: appointment.customerPhone,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        projectType: appointment.projectType,
        address: appointment.address,
        notes: appointment.notes,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    });

  } catch (error) {
    console.error('Get appointment API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch appointment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Cancel or update appointment
 */
export async function PATCH(request: NextRequest) {
  try {
    const { appointmentId, action, ...updateData } = await request.json();

    if (!appointmentId || !action) {
      return NextResponse.json(
        { error: 'Appointment ID and action are required' },
        { status: 400 }
      );
    }

    let result: { success: boolean; error?: string } = { success: false };

    switch (action) {
      case 'cancel':
        result.success = calendarEngine.cancelAppointment(appointmentId);
        break;
      
      case 'reschedule':
        if (!updateData.newDate || !updateData.newStartTime) {
          return NextResponse.json(
            { error: 'New date and start time are required for rescheduling' },
            { status: 400 }
          );
        }
        result = calendarEngine.rescheduleAppointment(
          appointmentId, 
          updateData.newDate, 
          updateData.newStartTime
        );
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "cancel" or "reschedule"' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update appointment' },
        { status: 400 }
      );
    }

    const updatedAppointment = calendarEngine.getAppointment(appointmentId);

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: `Appointment ${action}d successfully`
    });

  } catch (error) {
    console.error('Update appointment API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to update appointment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}