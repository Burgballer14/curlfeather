/**
 * Calendar Engine for Appointment Scheduling
 * Handles availability, booking, and appointment management
 */

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  projectType: string;
  address: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

export interface CalendarConfig {
  businessHours: BusinessHours;
  slotDuration: number; // minutes
  bufferTime: number; // minutes between appointments
  maxAdvanceDays: number; // how far ahead customers can book
  timeZone: string;
}

class CalendarEngine {
  private appointments: Map<string, Appointment> = new Map();
  private config: CalendarConfig;

  constructor() {
    this.config = {
      businessHours: {
        monday: { start: '08:00', end: '17:00', enabled: true },
        tuesday: { start: '08:00', end: '17:00', enabled: true },
        wednesday: { start: '08:00', end: '17:00', enabled: true },
        thursday: { start: '08:00', end: '17:00', enabled: true },
        friday: { start: '08:00', end: '17:00', enabled: true },
        saturday: { start: '09:00', end: '15:00', enabled: true },
        sunday: { start: '09:00', end: '15:00', enabled: false }
      },
      slotDuration: 120, // 2 hour appointments for drywall estimates
      bufferTime: 30, // 30 minutes between appointments
      maxAdvanceDays: 30,
      timeZone: 'America/Denver'
    };
  }

  /**
   * Generate available time slots for a given date
   */
  generateAvailableSlots(date: string): TimeSlot[] {
    const dayKey = this.getDayKey(new Date(date));
    const businessHour = this.config.businessHours[dayKey as keyof BusinessHours];
    
    if (!businessHour.enabled) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const startTime = this.parseTime(businessHour.start);
    const endTime = this.parseTime(businessHour.end);
    const slotDuration = this.config.slotDuration;
    const bufferTime = this.config.bufferTime;

    let currentTime = startTime;
    
    while (currentTime + slotDuration <= endTime) {
      const slotId = `${date}_${this.formatTime(currentTime)}`;
      const isBooked = this.isSlotBooked(date, this.formatTime(currentTime));
      
      slots.push({
        id: slotId,
        date,
        startTime: this.formatTime(currentTime),
        endTime: this.formatTime(currentTime + slotDuration),
        isAvailable: !isBooked && this.isDateAvailable(date),
        isBooked
      });

      currentTime += slotDuration + bufferTime;
    }

    return slots;
  }

  /**
   * Book an appointment
   */
  bookAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; appointmentId?: string; error?: string } {
    // Validate slot availability
    const slot = this.generateAvailableSlots(appointmentData.date)
      .find(s => s.startTime === appointmentData.startTime);
    
    if (!slot || !slot.isAvailable) {
      return { success: false, error: 'Selected time slot is not available' };
    }

    // Create appointment
    const appointmentId = this.generateAppointmentId();
    const appointment: Appointment = {
      ...appointmentData,
      id: appointmentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.appointments.set(appointmentId, appointment);

    return { success: true, appointmentId };
  }

  /**
   * Get available dates for the next N days
   */
  getAvailableDates(daysAhead: number = 14): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= Math.min(daysAhead, this.config.maxAdvanceDays); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayKey = this.getDayKey(date);
      const businessHour = this.config.businessHours[dayKey as keyof BusinessHours];
      
      if (businessHour.enabled && this.hasAvailableSlots(dateString)) {
        dates.push(dateString);
      }
    }

    return dates;
  }

  /**
   * Get appointment by ID
   */
  getAppointment(appointmentId: string): Appointment | null {
    return this.appointments.get(appointmentId) || null;
  }

  /**
   * Get all appointments for a date
   */
  getAppointmentsByDate(date: string): Appointment[] {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /**
   * Cancel an appointment
   */
  cancelAppointment(appointmentId: string): boolean {
    const appointment = this.appointments.get(appointmentId);
    if (appointment) {
      appointment.status = 'cancelled';
      appointment.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Reschedule an appointment
   */
  rescheduleAppointment(appointmentId: string, newDate: string, newStartTime: string): { success: boolean; error?: string } {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Check if new slot is available
    const slot = this.generateAvailableSlots(newDate)
      .find(s => s.startTime === newStartTime);
    
    if (!slot || !slot.isAvailable) {
      return { success: false, error: 'New time slot is not available' };
    }

    // Update appointment
    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = this.formatTime(
      this.parseTime(newStartTime) + this.config.slotDuration
    );
    appointment.updatedAt = new Date();

    return { success: true };
  }

  // Private helper methods
  private getDayKey(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private isSlotBooked(date: string, startTime: string): boolean {
    return Array.from(this.appointments.values()).some(
      appointment => 
        appointment.date === date && 
        appointment.startTime === startTime &&
        appointment.status !== 'cancelled'
    );
  }

  private isDateAvailable(date: string): boolean {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return appointmentDate >= today;
  }

  private hasAvailableSlots(date: string): boolean {
    const slots = this.generateAvailableSlots(date);
    return slots.some(slot => slot.isAvailable);
  }

  private generateAppointmentId(): string {
    return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global calendar engine instance
export const calendarEngine = new CalendarEngine();