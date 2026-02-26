"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
interface Student {
  id: number;
  name: string;
  email: string;
  college: string;
  phone: string;
  events: number;
  accommodation: string;
  totalSpent: number;
  status: string;
  joined: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  endDate: string;
  participants: number;
  capacity: number;
  fee: number;
  venue: string;
  type: string;
  status: string;
  revenue: number;
  description?: string;
}

interface Accommodation {
  id: number;
  type: string;
  total: number;
  occupied: number;
  available: number;
  revenue: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
}

interface Registration {
  id: number;
  studentId: number;
  eventId: number;
  studentName: string;
  studentEmail: string;
  teamName?: string;
  specialRequirements?: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

interface AccommodationBooking {
  id: number;
  studentId: number;
  accommodationId: number;
  studentName: string;
  studentEmail: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalAmount: number;
  bookingDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  specialRequests?: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  date: string;
  author: string;
  priority: 'low' | 'medium' | 'high';
}

interface DataContextType {
  students: Student[];
  events: Event[];
  accommodations: Accommodation[];
  registrations: Registration[];
  accommodationBookings: AccommodationBooking[];
  announcements: Announcement[];
  deletedStudentEmails: string[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: number, updates: Partial<Student>) => void;
  deleteStudent: (id: number) => void;
  addEvent: (event: Omit<Event, 'id' | 'participants' | 'revenue' | 'status'>) => void;
  updateEvent: (id: number, updates: Partial<Event>) => void;
  deleteEvent: (id: number) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  updateAnnouncement: (id: number, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: number) => void;
  addAccommodation: (accommodation: Omit<Accommodation, 'id' | 'occupied' | 'available' | 'revenue'>) => void;
  updateAccommodation: (id: number, updates: Partial<Accommodation>) => void;
  deleteAccommodation: (id: number) => void;
  registerStudentForEvent: (registration: Omit<Registration, 'id' | 'registrationDate'>) => void;
  bookAccommodation: (booking: Omit<AccommodationBooking, 'id' | 'bookingDate'>) => void;
  getAccommodationBookings: (accommodationId: number) => AccommodationBooking[];
  getEventRegistrations: (eventId: number) => Registration[];
  getStudentRegistrations: (studentId: number) => Registration[];
  clearAllData: () => void;
  getStats: () => {
    totalStudents: number;
    totalEvents: number;
    totalRevenue: number;
    occupancyRate: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper functions for localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Load data from localStorage or use defaults
  const [students, setStudents] = useState<Student[]>(() =>
    loadFromStorage('sems_students', [
      {
        id: 1,
        name: "Arjun Kumar",
        email: "arjun@srieshwar.edu.in",
        college: "Sri Eshwar College of Engineering",
        phone: "+91-9876543210",
        events: 2,
        accommodation: "Deluxe Room",
        totalSpent: 450,
        status: "active",
        joined: "2024-01-15"
      },
      {
        id: 2,
        name: "Priya Sharma",
        email: "priya@psg.edu.in",
        college: "PSG College of Technology",
        phone: "+91-9876543211",
        events: 1,
        accommodation: "Standard Room",
        totalSpent: 200,
        status: "active",
        joined: "2024-01-20"
      },
      {
        id: 3,
        name: "Rajesh Patel",
        email: "rajesh@kpr.edu.in",
        college: "KPR Institute of Engineering and Technology",
        phone: "+91-9876543212",
        events: 3,
        accommodation: "Suite",
        totalSpent: 750,
        status: "active",
        joined: "2024-01-10"
      },
      {
        id: 4,
        name: "Sneha Reddy",
        email: "sneha@vit.edu.in",
        college: "VIT University",
        phone: "+91-9876543213",
        events: 1,
        accommodation: "Standard Room",
        totalSpent: 300,
        status: "active",
        joined: "2024-01-25"
      },
      {
        id: 5,
        name: "Karthik Krishnan",
        email: "karthik@srm.edu.in",
        college: "SRM Institute of Science and Technology",
        phone: "+91-9876543214",
        events: 2,
        accommodation: "Not Booked",
        totalSpent: 500,
        status: "active",
        joined: "2024-02-01"
      },
      {
        id: 6,
        name: "Meera Nair",
        email: "meera@excel.edu.in",
        college: "Excel Engineering College",
        phone: "+91-9876543215",
        events: 1,
        accommodation: "Not Booked",
        totalSpent: 150,
        status: "active",
        joined: "2024-02-05"
      }
    ])
  );

  const [events, setEvents] = useState<Event[]>(() =>
    loadFromStorage('sems_events', [
      {
        id: 1,
        name: "Basketball Championship",
        description: "Annual basketball tournament",
        date: "2024-03-15",
        venue: "Sports Complex",
        fee: 500,
        participants: 2,
        revenue: 1000,
        status: "upcoming",
        capacity: 50,
        type: "sports",
        endDate: "2024-03-15"
      },
      {
        id: 2,
        name: "Football League",
        description: "Inter-college football competition",
        date: "2024-03-20",
        venue: "Main Stadium",
        fee: 750,
        participants: 1,
        revenue: 750,
        status: "upcoming",
        capacity: 30,
        type: "sports",
        endDate: "2024-03-20"
      },
      {
        id: 3,
        name: "Swimming Competition",
        description: "Swimming championship event",
        date: "2024-03-25",
        venue: "Aquatic Center",
        fee: 300,
        participants: 0,
        revenue: 0,
        status: "upcoming",
        capacity: 25,
        type: "sports",
        endDate: "2024-03-25"
      }
    ])
  );

  const [accommodations, setAccommodations] = useState<Accommodation[]>(() =>
    loadFromStorage('sems_accommodations', [])
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadFromStorage('sems_announcements', [])
  );

  const [registrations, setRegistrations] = useState<Registration[]>(() =>
    loadFromStorage('sems_registrations', [
      {
        id: 1,
        studentId: 1,
        eventId: 1,
        studentName: "John Doe",
        studentEmail: "john@example.com",
        teamName: "Thunder Bolts",
        specialRequirements: "Vegetarian meals",
        registrationDate: "2024-02-15",
        paymentStatus: 'completed'
      },
      {
        id: 2,
        studentId: 2,
        eventId: 1,
        studentName: "Jane Smith",
        studentEmail: "jane@example.com",
        teamName: "Lightning Strikers",
        specialRequirements: "None",
        registrationDate: "2024-02-16",
        paymentStatus: 'completed'
      },
      {
        id: 3,
        studentId: 3,
        eventId: 2,
        studentName: "Mike Johnson",
        studentEmail: "mike@example.com",
        teamName: "Ocean Warriors",
        specialRequirements: "Wheelchair accessible seating",
        registrationDate: "2024-02-17",
        paymentStatus: 'pending'
      }
    ])
  );

  const [accommodationBookings, setAccommodationBookings] = useState<AccommodationBooking[]>(() =>
    loadFromStorage('sems_accommodation_bookings', [])
  );

  const [deletedStudentEmails, setDeletedStudentEmails] = useState<string[]>(() =>
    loadFromStorage('sems_deleted_students', [])
  );

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    saveToStorage('sems_students', students);
  }, [students]);

  React.useEffect(() => {
    saveToStorage('sems_events', events);
  }, [events]);

  React.useEffect(() => {
    saveToStorage('sems_accommodations', accommodations);
  }, [accommodations]);

  React.useEffect(() => {
    saveToStorage('sems_announcements', announcements);
  }, [announcements]);

  React.useEffect(() => {
    saveToStorage('sems_registrations', registrations);
  }, [registrations]);

  React.useEffect(() => {
    saveToStorage('sems_accommodation_bookings', accommodationBookings);
  }, [accommodationBookings]);

  React.useEffect(() => {
    saveToStorage('sems_deleted_students', deletedStudentEmails);
  }, [deletedStudentEmails]);

  // Functions
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: Date.now() };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: number, updates: Partial<Student>) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updates } : student
    ));
  };

  const deleteStudent = (id: number) => {
    // Find the student to get their email before deleting
    const studentToDelete = students.find(student => student.id === id);
    if (studentToDelete) {
      // Add email to deleted list
      setDeletedStudentEmails(prev => [...prev, studentToDelete.email]);
    }

    // Remove student from active list
    setStudents(prev => prev.filter(student => student.id !== id));

    // Clean up all related data for this student
    setRegistrations(prev => prev.filter(reg => reg.studentId !== id));

    // Note: Accommodations are shared resources, so we don't delete them
    // but the student's booking reference is removed with the student data
  };

  const addEvent = (event: Omit<Event, 'id' | 'participants' | 'revenue' | 'status'>) => {
    const newEvent = {
      ...event,
      id: Date.now(),
      participants: 0,
      revenue: 0,
      status: 'active' as const
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: number, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: number) => {
    // Remove event and all its registrations
    setEvents(prev => prev.filter(event => event.id !== id));
    setRegistrations(prev => prev.filter(reg => reg.eventId !== id));
  };

  const registerStudentForEvent = (registration: Omit<Registration, 'id' | 'registrationDate'>) => {
    const student = students.find(s => s.id === registration.studentId);
    const event = events.find(e => e.id === registration.eventId);

    if (student && event) {
      // Create new registration
      const newRegistration: Registration = {
        ...registration,
        id: Date.now(),
        registrationDate: new Date().toISOString().split('T')[0],
        studentName: student.name,
        studentEmail: student.email,
        paymentStatus: 'completed'
      };

      setRegistrations(prev => [...prev, newRegistration]);

      // Update student's event count and spending
      updateStudent(registration.studentId, {
        events: student.events + 1,
        totalSpent: student.totalSpent + event.fee
      });

      // Update event participants and revenue
      updateEvent(registration.eventId, {
        participants: event.participants + 1,
        revenue: event.revenue + event.fee
      });
    }
  };

  const getEventRegistrations = (eventId: number) => {
    return registrations.filter(reg => reg.eventId === eventId);
  };

  const getStudentRegistrations = (studentId: number) => {
    return registrations.filter(reg => reg.studentId === studentId);
  };

  // Clear all data (for testing)
  const clearAllData = () => {
    setStudents([]);
    setEvents([]);
    setAnnouncements([]);
    setRegistrations([]);
    setAccommodations([]);
    setAccommodationBookings([]);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sems_students');
      localStorage.removeItem('sems_events');
      localStorage.removeItem('sems_announcements');
      localStorage.removeItem('sems_registrations');
      localStorage.removeItem('sems_accommodations');
      localStorage.removeItem('sems_accommodation_bookings');
    }
  };

  const addAccommodation = (accommodation: Omit<Accommodation, 'id' | 'occupied' | 'available' | 'revenue'>) => {
    const newId = Math.max(0, ...accommodations.map(a => a.id)) + 1;
    const newAccommodation: Accommodation = {
      ...accommodation,
      id: newId,
      occupied: 0,
      available: accommodation.total,
      revenue: 0
    };
    setAccommodations(prev => [...prev, newAccommodation]);
  };

  const updateAccommodation = (id: number, updates: Partial<Accommodation>) => {
    setAccommodations(prev => prev.map(acc =>
      acc.id === id ? { ...acc, ...updates } : acc
    ));
  };

  const deleteAccommodation = (id: number) => {
    setAccommodations(prev => prev.filter(acc => acc.id !== id));
  };

  const bookAccommodation = (booking: Omit<AccommodationBooking, 'id' | 'bookingDate'>) => {
    const accommodation = accommodations.find(a => a.id === booking.accommodationId);
    if (accommodation && accommodation.available > 0) {
      const newBookingId = Math.max(0, ...accommodationBookings.map(b => b.id)) + 1;
      const newBooking: AccommodationBooking = {
        ...booking,
        id: newBookingId,
        bookingDate: new Date().toISOString().split('T')[0]
      };

      // Add booking record
      setAccommodationBookings(prev => [...prev, newBooking]);

      // Update accommodation stats
      setAccommodations(prev => prev.map(acc =>
        acc.id === booking.accommodationId
          ? { ...acc, occupied: acc.occupied + 1, available: acc.available - 1, revenue: acc.revenue + booking.totalAmount }
          : acc
      ));

      // Update student accommodation
      updateStudent(booking.studentId, {
        accommodation: `Room-${Math.floor(Math.random() * 999)} (${accommodation.type})`
      });
    }
  };

  const getAccommodationBookings = (accommodationId: number): AccommodationBooking[] => {
    return accommodationBookings.filter(booking => booking.accommodationId === accommodationId);
  };

  const getAccommodationPrice = (type: string): number => {
    const prices: { [key: string]: number } = {
      "2-Sharing": 800,
      "3-Sharing": 600,
      "4-Sharing": 450,
      "5-Sharing": 350
    };
    return prices[type] || 500;
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
  };

  const updateAnnouncement = (id: number, updates: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(announcement =>
      announcement.id === id ? { ...announcement, ...updates } : announcement
    ));
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
  };

  const getStats = () => {
    const totalStudents = students.length;
    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0) +
                        accommodations.reduce((sum, acc) => sum + acc.revenue, 0);
    const totalRooms = accommodations.reduce((sum, acc) => sum + acc.total, 0);
    const occupiedRooms = accommodations.reduce((sum, acc) => sum + acc.occupied, 0);
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    return {
      totalStudents,
      totalEvents,
      totalRevenue,
      occupancyRate
    };
  };

  const value = {
    students,
    events,
    accommodations,
    registrations,
    accommodationBookings,
    announcements,
    deletedStudentEmails,
    addStudent,
    updateStudent,
    deleteStudent,
    addEvent,
    updateEvent,
    deleteEvent,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    registerStudentForEvent,
    bookAccommodation,
    getAccommodationBookings,
    getEventRegistrations,
    getStudentRegistrations,
    clearAllData,
    getStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
