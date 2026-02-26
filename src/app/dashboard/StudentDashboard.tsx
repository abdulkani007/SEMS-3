"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import Card, { StatCard } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useData } from "../contexts/DataContext";
import { useNotification } from "../contexts/NotificationContext";

interface StudentDashboardProps {
  session: Session;
}

export default function StudentDashboard({ session }: StudentDashboardProps) {
  const {
    events,
    announcements,
    accommodations,
    registerStudentForEvent,
    bookAccommodation,
    getStudentRegistrations,
    students,
    addStudent,
    deletedStudentEmails
  } = useData();

  const { addNotification } = useNotification();

  const [showEventModal, setShowEventModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    teamName: "",
    specialRequirements: ""
  });

  // Get current student data based on session email
  const existingStudent = students.find(student =>
    student.email === session.user?.email
  );

  // Create or use existing student
  const currentStudent = existingStudent || {
    id: Date.now(), // Generate unique ID for new students
    name: session.user?.name || "Student",
    email: session.user?.email || "student@example.com",
    college: "Default College",
    phone: "+1-000-000-0000",
    events: 0,
    accommodation: "Not Booked",
    totalSpent: 0,
    status: "active" as const,
    joined: new Date().toISOString().split('T')[0]
  };

  // Check if student was explicitly deleted by admin
  const wasDeleted = session.user?.email && deletedStudentEmails.includes(session.user.email);

  // If student was deleted, show access denied message
  if (wasDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Your student account has been removed from the system. Please contact the administrator for assistance.
            </p>
            <button
              onClick={() => window.location.href = '/signin'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If this is a new student (not in database), add them automatically
  useEffect(() => {
    if (!existingStudent && session.user?.email && session.user?.name && !wasDeleted) {
      const newStudent = {
        name: session.user.name,
        email: session.user.email,
        college: "Default College",
        phone: "+1-000-000-0000",
        events: 0,
        accommodation: "Not Booked",
        totalSpent: 0,
        status: "active",
        joined: new Date().toISOString().split('T')[0]
      };
      addStudent(newStudent);
    }
  }, [existingStudent, session.user?.email, session.user?.name, addStudent, wasDeleted]);

  const studentRegistrations = getStudentRegistrations(currentStudent.id);


  // Get real data from context
  const stats = {
    eventsRegistered: studentRegistrations.length,
    accommodationStatus: currentStudent?.accommodation || "Not Booked",
    totalSpent: currentStudent?.totalSpent || 0,
    rewardPoints: Math.floor((currentStudent?.totalSpent || 0) / 10),
  };

  const availableEvents = events;

  // Helper functions for accommodation - now using actual accommodation data
  const getAccommodationPrice = (type: string): number => {
    const accommodation = accommodations.find(acc => acc.type === type);
    if (accommodation) {
      // Use hardcoded prices for now since price isn't stored in accommodation object
      const prices: { [key: string]: number } = {
        "2-Sharing": 800,
        "3-Sharing": 600,
        "4-Sharing": 450,
        "5-Sharing": 350
      };
      return prices[type] || 500;
    }
    return 500;
  };

  const getAccommodationAmenities = (type: string): string[] => {
    // Default amenities based on type
    const amenities: { [key: string]: string[] } = {
      "2-Sharing": ["AC", "WiFi", "Breakfast", "Private Bathroom"],
      "3-Sharing": ["AC", "WiFi", "Breakfast"],
      "4-Sharing": ["WiFi", "Breakfast"],
      "5-Sharing": ["WiFi", "Breakfast"]
    };
    return amenities[type] || ["WiFi"];
  };

  // Handle accommodation booking
  const handleAccommodationBooking = (type: string) => {
    if (!currentStudent) {
      addNotification({
        type: 'error',
        title: 'Profile Required',
        message: 'Please complete your profile first.',
        duration: 5000
      });
      return;
    }

    if (currentStudent.accommodation !== 'Not Booked') {
      addNotification({
        type: 'warning',
        title: 'Already Booked',
        message: 'You already have an accommodation booking.',
        duration: 5000
      });
      return;
    }

    const accommodation = accommodations.find(a => a.type === type);
    if (!accommodation || accommodation.available === 0) {
      addNotification({
        type: 'error',
        title: 'Not Available',
        message: 'This accommodation type is not available.',
        duration: 5000
      });
      return;
    }

    // Create booking with proper structure
    const checkInDate = new Date().toISOString().split('T')[0];
    const checkOutDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days later
    const numberOfNights = 7;
    const totalAmount = accommodation.pricePerNight * numberOfNights;

    bookAccommodation({
      studentId: currentStudent.id,
      accommodationId: accommodation.id,
      studentName: currentStudent.name,
      studentEmail: currentStudent.email,
      checkInDate,
      checkOutDate,
      numberOfNights,
      totalAmount,
      paymentStatus: 'completed',
      specialRequests: ''
    });

    addNotification({
      type: 'success',
      title: 'Booking Confirmed!',
      message: `Your ${type} accommodation has been booked successfully for ₹${totalAmount}.`,
      duration: 5000
    });

    setShowAccommodationModal(false);
  };

  // Handle event registration
  const handleEventRegistration = () => {
    if (selectedEvent && currentStudent) {
      registerStudentForEvent({
        studentId: currentStudent.id,
        eventId: selectedEvent.id,
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        teamName: registrationForm.teamName,
        specialRequirements: registrationForm.specialRequirements,
        paymentStatus: 'completed'
      });

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Registration Successful!',
        message: `You have successfully registered for ${selectedEvent.name}. Payment of ₹${selectedEvent.fee} has been processed.`,
        duration: 5000
      });

      // Reset form and close modal
      setRegistrationForm({
        teamName: "",
        specialRequirements: ""
      });
      setSelectedEvent(null);
      setShowEventModal(false);
    }
  };

  // Get student's accommodation bookings from context
  const studentAccommodationBookings = currentStudent?.accommodation ? [{
    id: 1,
    type: currentStudent.accommodation.includes('2-sharing') ? '2-sharing' :
          currentStudent.accommodation.includes('3-sharing') ? '3-sharing' :
          currentStudent.accommodation.includes('4-sharing') ? '4-sharing' :
          currentStudent.accommodation.includes('5-sharing') ? '5-sharing' : 'Not Booked',
    dates: "Current Booking",
    status: currentStudent.accommodation !== "Not Booked" ? "confirmed" : "not-booked",
    amount: currentStudent.accommodation.includes('2-sharing') ? 800 :
            currentStudent.accommodation.includes('3-sharing') ? 600 :
            currentStudent.accommodation.includes('4-sharing') ? 450 :
            currentStudent.accommodation.includes('5-sharing') ? 350 : 0,
    roomNumber: currentStudent.accommodation.split(' ')[0] || "Not Assigned",
    checkIn: "Current",
    checkOut: "Current",
    amenities: ["WiFi", "AC", "Breakfast"]
  }] : [];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-200/40 to-indigo-300/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-indigo-200/40 to-purple-300/40 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-100/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Welcome back, {session.user?.name || session.user?.email?.split('@')[0]}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Your personalized sports event management hub
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: "Registered Events",
              value: "3",
              change: "+2 this month",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50"
            },
            {
              title: "Accommodation",
              value: "1",
              change: "Room A-301 confirmed",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              ),
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-50 to-emerald-50"
            },
            {
              title: "Total Spent",
              value: "₹2,050",
              change: "+₹1,250 this month",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              ),
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-50 to-pink-50"
            },
            {
              title: "Rewards Points",
              value: "1,250",
              change: "+150 points earned",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ),
              gradient: "from-orange-500 to-red-500",
              bgGradient: "from-orange-50 to-red-50"
            }
          ].map((stat) => (
            <div
              key={stat.title}
              className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="text-xs font-medium">Trending</span>
                  </div>
                </div>

                <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="text-green-600">↗</span>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Register Event",
                  description: "Join exciting competitions",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ),
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50",
                  onClick: () => setShowEventModal(true)
                },
                {
                  title: "Book Room",
                  description: "Reserve accommodation",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  ),
                  gradient: "from-green-500 to-emerald-500",
                  bgGradient: "from-green-50 to-emerald-50",
                  onClick: () => setShowAccommodationModal(true)
                },
                {
                  title: "Campus Map",
                  description: "Navigate venues & routes",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  ),
                  gradient: "from-purple-500 to-pink-500",
                  bgGradient: "from-purple-50 to-pink-50",
                  onClick: () => setShowMapModal(true)
                },
                {
                  title: "Payment Hub",
                  description: "Manage transactions",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                  gradient: "from-orange-500 to-red-500",
                  bgGradient: "from-orange-50 to-red-50",
                  onClick: () => setShowPaymentModal(true)
                }
              ].map((action) => (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className={`group relative p-5 bg-gradient-to-br ${action.bgGradient} rounded-xl border border-white/50 hover:shadow-lg transition-all duration-300 text-left overflow-hidden`}
                >
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Announcements */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">Latest Announcements</h2>
                {announcements.length > 3 && (
                  <p className="text-sm text-gray-500 mt-1">Scroll to see all {announcements.length} announcements</p>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <div className="space-y-4 pr-2">
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-secondary-600">No announcements yet.</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                  <div key={announcement.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                    announcement.type === 'urgent' ? 'bg-red-50 border border-red-200' :
                    announcement.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    announcement.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      announcement.type === 'urgent' ? 'bg-red-100' :
                      announcement.type === 'warning' ? 'bg-yellow-100' :
                      announcement.type === 'success' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        announcement.type === 'urgent' ? 'text-red-600' :
                        announcement.type === 'warning' ? 'text-yellow-600' :
                        announcement.type === 'success' ? 'text-green-600' :
                        'text-blue-600'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-secondary-900">{announcement.title}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-600 mb-1">{announcement.message}</p>
                      <p className="text-xs text-secondary-500">By {announcement.author} • {announcement.date}</p>
                    </div>
                  </div>
                  ))
                )}
                </div>
              </div>
              {/* Scroll indicator gradient */}
              {announcements.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Events Section */}
        <div className="mt-10 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">
              View All Events
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-lg">No events available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for new events!</p>
              </div>
            ) : (
              availableEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{event.name}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        getStudentRegistrations(currentStudent?.id || 0).some(reg => reg.eventId === event.id)
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {getStudentRegistrations(currentStudent?.id || 0).some(reg => reg.eventId === event.id) ? '✓ Registered' : '○ Available'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-gray-900">₹{event.fee}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{event.venue || 'Venue TBA'}</span>
                      </div>
                    </div>

                    {getStudentRegistrations(currentStudent?.id || 0).some(reg => reg.eventId === event.id) ? (
                      <button
                        disabled
                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Already Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Event Registration Modal */}
        <Modal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          title="Event Registration"
          size="xl"
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Available Events</h3>
              <p className="text-secondary-600">Choose from our exciting lineup of events</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEvents.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <svg className="w-12 h-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-secondary-600">No events available yet.</p>
                  <p className="text-sm text-secondary-500 mt-1">Check back later for new events!</p>
                </div>
              ) : (
                availableEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedEvent?.id === event.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'hackathon' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'workshop' ? 'bg-green-100 text-green-800' :
                      event.type === 'competition' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {event.type}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">₹{event.fee}</div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-secondary-900 mb-2">{event.name}</h3>
                  <p className="text-sm text-secondary-600 mb-3">{event.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-secondary-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-secondary-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.venue}
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>

            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary-50 rounded-xl p-6"
              >
                <h4 className="font-semibold text-secondary-900 mb-4">Registration Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Team Name (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter team name"
                      value={registrationForm.teamName}
                      onChange={(e) => setRegistrationForm({...registrationForm, teamName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Special Requirements
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Dietary, accessibility, etc."
                      value={registrationForm.specialRequirements}
                      onChange={(e) => setRegistrationForm({...registrationForm, specialRequirements: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg border border-secondary-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-secondary-900">Registration Fee:</span>
                    <span className="text-xl font-bold text-primary-600">₹{selectedEvent.fee}</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                disabled={!selectedEvent}
                onClick={handleEventRegistration}
              >
                {selectedEvent ? `Register for ₹${selectedEvent.fee}` : 'Select an Event'}
              </Button>
              <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showAccommodationModal}
          onClose={() => {
            setShowAccommodationModal(false);
            setSelectedAccommodation(null);
          }}
          title="Book Accommodation"
          size="lg"
        >
          <div className="space-y-6">
            <p className="text-secondary-600">Select your preferred accommodation type and dates.</p>

            {accommodations.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <p className="text-secondary-600">No accommodations available yet.</p>
                <p className="text-sm text-secondary-500 mt-2">Please check back later or contact admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accommodations.map((accommodation) => (
                <motion.div
                  key={accommodation.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    selectedAccommodation?.id === accommodation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedAccommodation(accommodation)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{accommodation.type}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      accommodation.available > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {accommodation.available} available
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    ₹{accommodation.pricePerNight}/night
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{accommodation.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {accommodation.amenities.map((amenity) => (
                      <span key={amenity} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  {accommodation.available === 0 && (
                    <p className="text-sm text-red-600 mt-2">Fully Booked</p>
                  )}
                </motion.div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                disabled={!selectedAccommodation}
                onClick={() => {
                  if (selectedAccommodation) {
                    handleAccommodationBooking(selectedAccommodation.type);
                  }
                }}
              >
                Book Now
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAccommodationModal(false);
                  setSelectedAccommodation(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Campus Map Modal */}
        <Modal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          title="Campus Map & Navigation"
          size="xl"
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Interactive Campus Map</h3>
              <div className="bg-white rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-secondary-300">
                <div className="text-center">
                  <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-secondary-600">Interactive map will be loaded here</p>
                  <p className="text-sm text-secondary-500">Navigate to event venues, accommodation, and facilities</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-secondary-900">Quick Locations</h4>
                {[
                  { name: "Main Auditorium", distance: "200m", time: "3 min walk" },
                  { name: "Sports Complex", distance: "500m", time: "7 min walk" },
                  { name: "Tech Lab", distance: "150m", time: "2 min walk" },
                  { name: "Cafeteria", distance: "100m", time: "1 min walk" }
                ].map((location) => (
                  <div key={location.name} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <span className="font-medium text-secondary-900">{location.name}</span>
                    <div className="text-right">
                      <div className="text-sm text-secondary-600">{location.distance}</div>
                      <div className="text-xs text-secondary-500">{location.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-secondary-900">Transportation</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="font-medium text-blue-900">Campus Shuttle</span>
                    </div>
                    <p className="text-sm text-blue-700">Every 15 minutes • Free</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium text-green-900">Parking Areas</span>
                    </div>
                    <p className="text-sm text-green-700">Multiple zones available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Payment History Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Payment History & Transactions"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-600">₹2,050</div>
                <div className="text-sm text-green-700">Total Spent</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-blue-700">Transactions</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">₹0</div>
                <div className="text-sm text-purple-700">Pending</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-secondary-900">Recent Transactions</h4>
              {[
                { id: "TXN001", description: "Tech Hackathon 2024 Registration", amount: 500, date: "2024-02-15", status: "completed" },
                { id: "TXN002", description: "Accommodation Booking (3-sharing)", amount: 1200, date: "2024-02-14", status: "completed" },
                { id: "TXN003", description: "Sports Tournament Registration", amount: 300, date: "2024-02-10", status: "pending" },
                { id: "TXN004", description: "Workshop Materials Fee", amount: 50, date: "2024-02-08", status: "completed" }
              ].map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-secondary-900">{transaction.description}</div>
                    <div className="text-sm text-secondary-600">
                      {transaction.id} • {transaction.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-secondary-900">₹{transaction.amount}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1">Download Receipt</Button>
              <Button variant="primary" className="flex-1">Make Payment</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
