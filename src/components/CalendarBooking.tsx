'use client';

import { useState, useEffect } from 'react';
import { TimeSlot, Appointment } from '@/lib/calendar/calendar-engine';

interface CalendarBookingProps {
  onAppointmentBooked?: (appointment: Appointment) => void;
  prefilledData?: {
    name?: string;
    email?: string;
    phone?: string;
    projectType?: string;
    address?: string;
  };
}

export default function CalendarBooking({ onAppointmentBooked, prefilledData }: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: prefilledData?.phone || '',
    projectType: prefilledData?.projectType || '',
    address: prefilledData?.address || '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');

  // Load available dates on component mount
  useEffect(() => {
    loadAvailableDates();
  }, []);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/dates');
      const data = await response.json();
      
      if (data.success) {
        setAvailableDates(data.dates);
      }
    } catch (error) {
      console.error('Failed to load available dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/slots?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.slots);
      }
    } catch (error) {
      console.error('Failed to load available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.projectType.trim()) newErrors.projectType = 'Project type is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!selectedSlot) newErrors.appointment = 'Please select a time slot';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookAppointment = async () => {
    if (!validateForm() || !selectedSlot) return;

    setBookingStatus('booking');

    try {
      const appointmentData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        projectType: formData.projectType,
        address: formData.address,
        notes: formData.notes,
        status: 'scheduled' as const
      };

      const response = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (data.success) {
        setBookingStatus('success');
        if (onAppointmentBooked && data.appointment) {
          onAppointmentBooked(data.appointment);
        }
        
        // Track appointment booking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'appointment_scheduled', {
            event_category: 'engagement',
            event_label: formData.projectType,
            value: 1
          });
        }
      } else {
        setBookingStatus('error');
        setErrors({ general: data.error || 'Failed to book appointment' });
      }
    } catch (error) {
      setBookingStatus('error');
      setErrors({ general: 'Network error. Please try again.' });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (bookingStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Scheduled!</h3>
          <p className="text-gray-600 mb-4">
            Your appointment has been scheduled for {selectedSlot && formatDate(selectedSlot.date)} at {selectedSlot && formatTime(selectedSlot.startTime)}.
          </p>
          <p className="text-sm text-gray-500">
            You'll receive a confirmation email shortly with all the details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Schedule Your Free Estimate</h2>

      {/* Step 1: Select Date */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Select a Date</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableDates.map(date => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                selectedDate === date
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Time */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Select a Time</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {loading ? (
              <div className="col-span-full text-center py-4">Loading available times...</div>
            ) : availableSlots.filter(slot => slot.isAvailable).map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  selectedSlot?.id === slot.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {selectedSlot && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
              <select
                value={formData.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select project type</option>
                <option value="new-construction">New Construction</option>
                <option value="repair">Repair Work</option>
                <option value="texture">Texture Work</option>
                <option value="painting-prep">Painting Preparation</option>
                <option value="basement-finish">Basement Finishing</option>
                <option value="commercial">Commercial Project</option>
                <option value="other">Other</option>
              </select>
              {errors.projectType && <p className="text-red-600 text-sm mt-1">{errors.projectType}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, Denver, CO 80203"
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us more about your project..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Button */}
      {selectedSlot && (
        <div className="text-center">
          {errors.general && (
            <p className="text-red-600 text-sm mb-3">{errors.general}</p>
          )}
          <button
            onClick={handleBookAppointment}
            disabled={bookingStatus === 'booking'}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingStatus === 'booking' ? 'Booking...' : 'Schedule Free Estimate'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your appointment: {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.startTime)}
          </p>
        </div>
      )}
    </div>
  );
}