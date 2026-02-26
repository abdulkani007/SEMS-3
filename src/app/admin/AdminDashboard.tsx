"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import Card, { StatCard } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { useData } from "../contexts/DataContext";
import { useNotification } from "../contexts/NotificationContext";

interface AdminDashboardProps {
  session: Session | null;
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const {
    students,
    events,
    accommodations,
    registrations,
    announcements,
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
    getEventRegistrations,
    getAccommodationBookings,
    getStats,
    clearAllData
  } = useData();

  const { addNotification } = useNotification();

  const [activeTab, setActiveTab] = useState("overview");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [showCampusMapModal, setShowCampusMapModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{id: number, name: string} | null>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<any>(null);
  const [showAccommodationDetailsModal, setShowAccommodationDetailsModal] = useState(false);
  const [selectedAccommodationForDetails, setSelectedAccommodationForDetails] = useState<any>(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    name: "",
    type: "",
    date: "",
    endDate: "",
    capacity: "",
    fee: "",
    venue: "",
    description: ""
  });

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "info" as 'info' | 'warning' | 'success' | 'urgent',
    priority: "medium" as 'low' | 'medium' | 'high',
    author: "Admin"
  });

  // Accommodation form state
  const [accommodationForm, setAccommodationForm] = useState({
    type: "",
    total: "",
    pricePerNight: "",
    amenities: [] as string[],
    description: ""
  });

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    yearOfStudy: "",
    department: ""
  });

  // Get real-time data from context
  const stats = getStats();
  const recentRegistrations = registrations.length;

  // Handle event creation
  const handleCreateEvent = () => {
    if (eventForm.name && eventForm.type && eventForm.date && eventForm.capacity && eventForm.fee) {
      addEvent({
        name: eventForm.name,
        type: eventForm.type,
        date: eventForm.date,
        endDate: eventForm.endDate || eventForm.date,
        capacity: parseInt(eventForm.capacity),
        fee: parseInt(eventForm.fee),
        venue: eventForm.venue,
        description: eventForm.description
      });

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Event Created Successfully!',
        message: `${eventForm.name} has been created and is now available for student registration.`,
        duration: 5000
      });

      // Reset form and close modal
      setEventForm({
        name: "",
        type: "",
        date: "",
        endDate: "",
        capacity: "",
        fee: "",
        venue: "",
        description: ""
      });
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  // Handle event update
  const handleUpdateEvent = () => {
    if (editingEvent && eventForm.name) {
      updateEvent(editingEvent.id, {
        name: eventForm.name,
        type: eventForm.type,
        date: eventForm.date,
        endDate: eventForm.endDate,
        capacity: parseInt(eventForm.capacity),
        fee: parseInt(eventForm.fee),
        venue: eventForm.venue,
        description: eventForm.description
      });

      // Reset form and close modal
      setEventForm({
        name: "",
        type: "",
        date: "",
        endDate: "",
        capacity: "",
        fee: "",
        venue: "",
        description: ""
      });
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  // Handle announcement creation
  const handleCreateAnnouncement = () => {
    if (announcementForm.title && announcementForm.message) {
      addAnnouncement({
        title: announcementForm.title,
        message: announcementForm.message,
        type: announcementForm.type,
        priority: announcementForm.priority,
        author: announcementForm.author
      });

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Announcement Created!',
        message: `${announcementForm.title} has been posted successfully.`,
        duration: 5000
      });

      // Reset form and close modal
      setAnnouncementForm({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        author: "Admin"
      });
      setShowAnnouncementModal(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEvent(eventId);
      addNotification({
        type: 'success',
        title: 'Event Deleted',
        message: 'Event has been successfully deleted.',
        duration: 3000
      });
    }
  };

  // Handle student creation
  const handleCreateStudent = () => {
    if (studentForm.name && studentForm.email && studentForm.phone && studentForm.college) {
      addStudent({
        name: studentForm.name,
        email: studentForm.email,
        phone: studentForm.phone,
        college: studentForm.college,
        events: 0,
        accommodation: "Not Booked",
        totalSpent: 0,
        status: "active",
        joined: new Date().toISOString().split('T')[0]
      });

      addNotification({
        type: 'success',
        title: 'Student Added!',
        message: `${studentForm.name} has been added successfully.`,
        duration: 5000
      });

      // Reset form and close modal
      setStudentForm({
        name: "",
        email: "",
        phone: "",
        college: "",
        yearOfStudy: "",
        department: ""
      });
      setShowStudentModal(false);
    }
  };

  // Handle accommodation creation
  const handleCreateAccommodation = () => {
    if (accommodationForm.type && accommodationForm.total && accommodationForm.pricePerNight) {
      // Add accommodation to context
      addAccommodation({
        type: accommodationForm.type,
        total: parseInt(accommodationForm.total),
        pricePerNight: parseInt(accommodationForm.pricePerNight),
        amenities: accommodationForm.amenities,
        description: accommodationForm.description
      });

      addNotification({
        type: 'success',
        title: 'Accommodation Added!',
        message: `${accommodationForm.type} accommodation has been added successfully.`,
        duration: 5000
      });

      // Reset form and close modal
      setAccommodationForm({
        type: "",
        total: "",
        pricePerNight: "",
        amenities: [],
        description: ""
      });
      setShowAccommodationModal(false);
    }
  };

  // Use real students data from context with filtering
  const recentStudents = students.filter(student => {
    // Filter by college if a specific college is selected
    if (filterCollege !== "all" && student.college !== filterCollege) {
      return false;
    }

    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.college.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Use real data from context
  const upcomingEvents = events;
  const accommodationStats = accommodations;

  // Delete student handlers
  const handleDeleteStudent = (studentId: number, studentName: string) => {
    console.log('Delete button clicked for student:', studentId, studentName);
    setStudentToDelete({ id: studentId, name: studentName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      console.log('Confirming delete for student:', studentToDelete);
      deleteStudent(studentToDelete.id);
      addNotification({
        type: 'success',
        message: `Student "${studentToDelete.name}" has been deleted successfully.`
      });
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const cancelDeleteStudent = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
  };

  // Event details handlers
  const handleViewEventDetails = (event: any) => {
    setSelectedEventForDetails(event);
    setShowEventDetailsModal(true);
  };

  const closeEventDetailsModal = () => {
    setShowEventDetailsModal(false);
    setSelectedEventForDetails(null);
  };

  // Accommodation details handlers
  const handleViewAccommodationDetails = (accommodation: any) => {
    setSelectedAccommodationForDetails(accommodation);
    setShowAccommodationDetailsModal(true);
  };

  const closeAccommodationDetailsModal = () => {
    setShowAccommodationDetailsModal(false);
    setSelectedAccommodationForDetails(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-indigo-200/50 to-purple-300/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-purple-200/50 to-pink-300/50 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Admin Header */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    Admin Control Center
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Comprehensive management hub for events, students & accommodations
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-500">System Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-green-600">All Systems Online</span>
                  </div>
                </div>

                <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg font-semibold">
                  📊 Export Data
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Admin Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: "Total Students",
              value: stats.totalStudents.toString(),
              change: "+24 this month",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              ),
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50"
            },
            {
              title: "Active Events",
              value: stats.totalEvents.toString(),
              change: "3 upcoming this week",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-50 to-emerald-50"
            },
            {
              title: "Accommodation",
              value: `${stats.occupancyRate}%`,
              change: "72% occupancy rate",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              ),
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-50 to-pink-50"
            },
            {
              title: "Total Revenue",
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              change: "+28% this month",
              trend: "up",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-medium">Growth</span>
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

        {/* Enhanced Navigation Tabs */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <nav className="flex space-x-2 overflow-x-auto">
              {[
                { id: "overview", name: "📊 Overview", icon: "📊" },
                { id: "events", name: "🎪 Events", icon: "🎪" },
                { id: "students", name: "👥 Students", icon: "👥" },
                { id: "accommodation", name: "🏨 Accommodation", icon: "🏨" },
                { id: "announcements", name: "📢 Announcements", icon: "📢" },
                { id: "campus-map", name: "🗺️ Campus Map", icon: "🗺️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Quick Actions */}
            <Card>
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEventModal(true)}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Create Event</h3>
                      <p className="text-sm text-secondary-600">Add new competitions</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAccommodationModal(true)}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Manage Rooms</h3>
                      <p className="text-sm text-secondary-600">Accommodation control</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Export Data</h3>
                      <p className="text-sm text-secondary-600">PDF/Excel reports</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAnnouncementModal(true)}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Announcements</h3>
                      <p className="text-sm text-secondary-600">Broadcast messages</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCampusMapModal(true)}
                  className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Campus Map</h3>
                      <p className="text-sm text-secondary-600">Manage locations</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Clear Data Button for Testing */}
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                      clearAllData();
                      addNotification({
                        type: 'success',
                        title: 'Data Cleared',
                        message: 'All data has been cleared successfully.',
                        duration: 3000
                      });
                    }
                  }}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Data (Testing)
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-success-50 rounded-lg">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">New Student Registration</p>
                    <p className="text-xs text-secondary-600">Mike Johnson joined Tech Hackathon</p>
                  </div>
                  <span className="text-xs text-secondary-500">5m ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">Payment Received</p>
                    <p className="text-xs text-secondary-600">₹1,200 for accommodation booking</p>
                  </div>
                  <span className="text-xs text-secondary-500">15m ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-lg">
                  <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">Event Updated</p>
                    <p className="text-xs text-secondary-600">Sports Tournament details modified</p>
                  </div>
                  <span className="text-xs text-secondary-500">1h ago</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "events" && (
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Event Management</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Events
                </Button>
                <Button onClick={() => setShowEventModal(true)} variant="primary" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Event
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Event Details</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Type & Venue</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Registration</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Revenue</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">{event.name}</div>
                          <div className="text-sm text-secondary-600">{event.date} - {event.endDate}</div>
                          <div className="text-xs text-secondary-500">Fee: ₹{event.fee}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                            event.type === 'hackathon' ? 'bg-blue-100 text-blue-800' :
                            event.type === 'sports' ? 'bg-green-100 text-green-800' :
                            event.type === 'cultural' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {event.type}
                          </span>
                          <div className="text-sm text-secondary-600">{event.venue}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {event.participants}/{event.capacity}
                          </div>
                          <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                event.participants / event.capacity > 0.8 ? 'bg-success-500' :
                                event.participants / event.capacity > 0.5 ? 'bg-primary-500' :
                                'bg-warning-500'
                              }`}
                              style={{ width: `${(event.participants / event.capacity) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-secondary-500 mt-1">
                            {Math.round((event.participants / event.capacity) * 100)}% filled
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm font-medium text-secondary-900">₹{event.revenue}</div>
                        <div className="text-xs text-secondary-500">
                          Avg: ₹{Math.round(event.revenue / event.participants)}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === 'active' ? 'bg-success-100 text-success-800' :
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEvent(event);
                              setEventForm({
                                name: event.name,
                                type: event.type,
                                date: event.date,
                                endDate: event.endDate,
                                capacity: event.capacity.toString(),
                                fee: event.fee.toString(),
                                venue: event.venue,
                                description: event.description || ""
                              });
                              setShowEventModal(true);
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEventDetails(event)}
                            title="View Event Details & Registrations"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "students" && (
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">Student Management</h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Showing {recentStudents.length} of {students.length} students
                  {filterCollege !== "all" && (
                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                      Filtered by: {filterCollege}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Search: "{searchTerm}"
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-secondary-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                >
                  <option value="all">All Colleges</option>
                  <option value="Sri Eshwar College of Engineering">Sri Eshwar College of Engineering</option>
                  <option value="PSG College of Technology">PSG College of Technology</option>
                  <option value="KPR Institute of Engineering and Technology">KPR Institute of Engineering and Technology</option>
                  <option value="Excel Engineering College">Excel Engineering College</option>
                  <option value="MIT Campus">MIT Campus</option>
                  <option value="VIT University">VIT University</option>
                  <option value="SRM Institute of Science and Technology">SRM Institute of Science and Technology</option>
                  <option value="Anna University">Anna University</option>
                  <option value="Coimbatore Institute of Technology">Coimbatore Institute of Technology</option>
                  <option value="Kumaraguru College of Technology">Kumaraguru College of Technology</option>
                  <option value="Amrita Vishwa Vidyapeetham">Amrita Vishwa Vidyapeetham</option>
                  <option value="Karunya Institute of Technology">Karunya Institute of Technology</option>
                  <option value="SNS College of Technology">SNS College of Technology</option>
                  <option value="Karpagam Academy of Higher Education">Karpagam Academy of Higher Education</option>
                  <option value="Dr. Mahalingam College of Engineering">Dr. Mahalingam College of Engineering</option>
                </select>
                {(filterCollege !== "all" || searchTerm) && (
                  <Button
                    onClick={() => {
                      setFilterCollege("all");
                      setSearchTerm("");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-secondary-600 hover:text-secondary-900"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => setShowStudentModal(true)} variant="primary" size="sm">
                  Add Student
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Student</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">College</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Events</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Accommodation</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Spent</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-secondary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className="text-secondary-600 mb-2">
                            {filterCollege !== "all" || searchTerm
                              ? "No students match your filters"
                              : "No students found"
                            }
                          </p>
                          {(filterCollege !== "all" || searchTerm) && (
                            <button
                              onClick={() => {
                                setFilterCollege("all");
                                setSearchTerm("");
                              }}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Clear filters to see all students
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((student) => (
                    <tr key={student.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">{student.name}</div>
                          <div className="text-sm text-secondary-600">{student.email}</div>
                          <div className="text-xs text-secondary-500">{student.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-secondary-600">{student.college}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.events} events
                        </span>
                      </td>
                      <td className="py-4 text-sm text-secondary-600">{student.accommodation}</td>
                      <td className="py-4 text-sm font-medium text-secondary-900">₹{student.totalSpent}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit Student">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            title="Delete Student"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-200">
              <div className="text-sm text-secondary-600">
                Showing 4 of 246 students
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "accommodation" && (
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Accommodation Management</h2>
              <Button onClick={() => setShowAccommodationModal(true)} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Accommodation
              </Button>
            </div>
            {accommodationStats.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <p className="text-secondary-600 mb-4">No accommodations added yet.</p>
                <p className="text-sm text-secondary-500">Click "Add Accommodation" to create your first accommodation option.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {accommodationStats.map((accommodation) => (
                  <div key={accommodation.id} className="p-4 bg-secondary-50 rounded-lg relative">


                    <h3 className="font-medium text-secondary-900 mb-2">{accommodation.type}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Total:</span>
                        <span className="font-medium">{accommodation.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Occupied:</span>
                        <span className="font-medium text-error-600">{accommodation.occupied}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Available:</span>
                        <span className="font-medium text-success-600">{accommodation.available}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Price/Night:</span>
                        <span className="font-medium text-primary-600">₹{accommodation.pricePerNight}</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${accommodation.total > 0 ? (accommodation.occupied / accommodation.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-secondary-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAccommodationDetails(accommodation)}
                        className="flex-1 text-blue-600 hover:bg-blue-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Bookings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${accommodation.type}? This action cannot be undone.`)) {
                            deleteAccommodation(accommodation.id);
                            addNotification({
                              type: 'success',
                              title: 'Accommodation Deleted',
                              message: `${accommodation.type} has been successfully deleted.`,
                              duration: 3000
                            });
                          }
                        }}
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "announcements" && (
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Announcements</h2>
              <Button onClick={() => setShowAnnouncementModal(true)} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Announcement
              </Button>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p className="text-secondary-600">No announcements yet. Create your first announcement to get started.</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border border-secondary-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-secondary-900">{announcement.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            announcement.type === 'urgent' ? 'bg-red-100 text-red-800' :
                            announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {announcement.type}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                            announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {announcement.priority} priority
                          </span>
                        </div>
                        <p className="text-secondary-700 mb-2">{announcement.message}</p>
                        <div className="text-sm text-secondary-500">
                          By {announcement.author} • {announcement.date}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAnnouncement(announcement.id)}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {activeTab === "campus-map" && (
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Campus Map Management</h2>
              <Button onClick={() => setShowCampusMapModal(true)} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Location
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campus Map Display */}
              <div className="bg-secondary-50 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Interactive Campus Map</h3>
                <div className="bg-white rounded-lg border-2 border-dashed border-secondary-300 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-secondary-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-secondary-600">Campus Map Preview</p>
                    <p className="text-sm text-secondary-500">Interactive map will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Location List */}
              <div>
                <h3 className="font-semibold text-secondary-900 mb-4">Campus Locations</h3>
                <div className="space-y-3">
                  {[
                    { name: "Main Auditorium", type: "Event Venue", capacity: "500 seats" },
                    { name: "Tech Lab", type: "Workshop Space", capacity: "50 seats" },
                    { name: "Sports Complex", type: "Sports Venue", capacity: "200 participants" },
                    { name: "Cultural Center", type: "Performance Hall", capacity: "300 seats" },
                    { name: "Innovation Hub", type: "Co-working Space", capacity: "100 seats" }
                  ].map((location, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-secondary-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-secondary-900">{location.name}</h4>
                          <p className="text-sm text-secondary-600">{location.type} • {location.capacity}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Modals */}

        {/* Event Creation/Edit Modal */}
        <Modal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          title={editingEvent ? "Edit Event" : "Create New Event"}
          size="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Event Name"
                placeholder="Enter event name"
                value={eventForm.name}
                onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Event Type</label>
                <select
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                >
                  <option value="">Select type</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="sports">Sports Event</option>
                  <option value="workshop">Workshop</option>
                  <option value="cultural">Cultural Event</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
              />
              <Input
                label="End Date"
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Capacity"
                type="number"
                placeholder="Maximum participants"
                value={eventForm.capacity}
                onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
              />
              <Input
                label="Registration Fee"
                type="number"
                placeholder="Fee in ₹"
                value={eventForm.fee}
                onChange={(e) => setEventForm({...eventForm, fee: e.target.value})}
              />
              <Input
                label="Venue"
                placeholder="Event venue"
                value={eventForm.venue}
                onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Event description and details"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
              >
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                  setEventForm({
                    name: "",
                    type: "",
                    date: "",
                    endDate: "",
                    capacity: "",
                    fee: "",
                    venue: "",
                    description: ""
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Student Management Modal */}
        <Modal
          isOpen={showStudentModal}
          onClose={() => setShowStudentModal(false)}
          title="Add New Student"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter student name"
                value={studentForm.name}
                onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                placeholder="Enter phone number"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
              />
              <Input
                label="College/University"
                placeholder="Enter college name"
                value={studentForm.college}
                onChange={(e) => setStudentForm({...studentForm, college: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Year of Study</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={studentForm.yearOfStudy}
                  onChange={(e) => setStudentForm({...studentForm, yearOfStudy: e.target.value})}
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Department</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({...studentForm, department: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="primary" className="flex-1" onClick={handleCreateStudent}>Add Student</Button>
              <Button variant="secondary" onClick={() => setShowStudentModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>

        {/* Announcement Modal */}
        <Modal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
          title="Broadcast Announcement"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <h3 className="font-semibold text-blue-900">Send to All Students</h3>
              </div>
              <p className="text-blue-700 text-sm">This announcement will be sent to all registered students via email and in-app notifications.</p>
            </div>

            <div>
              <Input label="Subject" placeholder="Enter announcement subject" />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Message</label>
              <textarea
                rows={6}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Type your announcement message here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Send Method</label>
                <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="both">Email + In-App</option>
                  <option value="email">Email Only</option>
                  <option value="app">In-App Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="primary" className="flex-1">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Announcement
              </Button>
              <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>

        {/* Announcement Creation Modal */}
        <Modal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
          title="Create New Announcement"
          size="lg"
        >
          <div className="space-y-6">
            <Input
              label="Announcement Title"
              placeholder="Enter announcement title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Message</label>
              <textarea
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Enter announcement message"
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm({...announcementForm, type: e.target.value as any})}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value as any})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreateAnnouncement}
              >
                Create Announcement
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementForm({
                    title: "",
                    message: "",
                    type: "info",
                    priority: "medium",
                    author: "Admin"
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Accommodation Management Modal */}
        <Modal
          isOpen={showAccommodationModal}
          onClose={() => setShowAccommodationModal(false)}
          title="Add New Accommodation"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Accommodation Type</label>
                <select
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={accommodationForm.type}
                  onChange={(e) => setAccommodationForm({...accommodationForm, type: e.target.value})}
                >
                  <option value="">Select type</option>
                  <option value="1-Sharing">1-Sharing</option>
                  <option value="2-Sharing">2-Sharing</option>
                  <option value="3-Sharing">3-Sharing</option>
                  <option value="4-Sharing">4-Sharing</option>
                  <option value="5-Sharing">5-Sharing</option>
                </select>
              </div>
              <Input
                label="Total Rooms"
                type="number"
                placeholder="Enter total rooms"
                value={accommodationForm.total}
                onChange={(e) => setAccommodationForm({...accommodationForm, total: e.target.value})}
              />
            </div>

            <Input
              label="Price per Night (₹)"
              type="number"
              placeholder="Enter price per night"
              value={accommodationForm.pricePerNight}
              onChange={(e) => setAccommodationForm({...accommodationForm, pricePerNight: e.target.value})}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Enter accommodation description"
                value={accommodationForm.description}
                onChange={(e) => setAccommodationForm({...accommodationForm, description: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreateAccommodation}
              >
                Add Accommodation
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAccommodationModal(false);
                  setAccommodationForm({
                    type: "",
                    total: "",
                    pricePerNight: "",
                    amenities: [],
                    description: ""
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Campus Map Modal */}
        <Modal
          isOpen={showCampusMapModal}
          onClose={() => setShowCampusMapModal(false)}
          title="Add Campus Location"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location Name"
                placeholder="Enter location name"
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Location Type</label>
                <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">Select type</option>
                  <option value="event-venue">Event Venue</option>
                  <option value="workshop-space">Workshop Space</option>
                  <option value="sports-venue">Sports Venue</option>
                  <option value="performance-hall">Performance Hall</option>
                  <option value="co-working-space">Co-working Space</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="dining">Dining</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Capacity"
                placeholder="Enter capacity"
              />
              <Input
                label="Building/Floor"
                placeholder="e.g., Building A, Floor 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Enter location description and amenities"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  addNotification({
                    type: 'success',
                    title: 'Location Added!',
                    message: 'Campus location has been added successfully.',
                    duration: 5000
                  });
                  setShowCampusMapModal(false);
                }}
              >
                Add Location
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCampusMapModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Event Details Modal */}
        <Modal
          isOpen={showEventDetailsModal}
          onClose={closeEventDetailsModal}
          title={`Event Details: ${selectedEventForDetails?.name || ''}`}
        >
          <div className="p-6">
            {selectedEventForDetails && (
              <div className="space-y-6">
                {/* Event Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Event Name:</span>
                      <p className="text-gray-900">{selectedEventForDetails.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="text-gray-900 capitalize">{selectedEventForDetails.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <p className="text-gray-900">{selectedEventForDetails.date}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Venue:</span>
                      <p className="text-gray-900">{selectedEventForDetails.venue}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Fee:</span>
                      <p className="text-gray-900">₹{selectedEventForDetails.fee}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Capacity:</span>
                      <p className="text-gray-900">{selectedEventForDetails.participants}/{selectedEventForDetails.capacity}</p>
                    </div>
                  </div>
                </div>

                {/* Registered Students */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Registered Students</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {(() => {
                      const eventRegistrations = getEventRegistrations(selectedEventForDetails.id);
                      return eventRegistrations.length === 0 ? (
                        <div className="p-8 text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 20H4v-2a3 3 0 015.196-2.121m0 0a5.002 5.002 0 019.608 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-gray-500">No students registered yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Requirements</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {eventRegistrations.map((registration) => (
                                <tr key={registration.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{registration.studentName}</div>
                                      <div className="text-sm text-gray-500">{registration.studentEmail}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {registration.teamName || 'Individual'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {registration.registrationDate}
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      registration.paymentStatus === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : registration.paymentStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {registration.paymentStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500">
                                    {registration.specialRequirements || 'None'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={closeEventDetailsModal}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Accommodation Details Modal */}
        <Modal
          isOpen={showAccommodationDetailsModal}
          onClose={closeAccommodationDetailsModal}
          title={`Accommodation Details: ${selectedAccommodationForDetails?.type || ''}`}
        >
          <div className="p-6">
            {selectedAccommodationForDetails && (
              <div className="space-y-6">
                {/* Accommodation Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Accommodation Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="text-gray-900">{selectedAccommodationForDetails.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Price per Night:</span>
                      <p className="text-gray-900">₹{selectedAccommodationForDetails.pricePerNight}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Total Rooms:</span>
                      <p className="text-gray-900">{selectedAccommodationForDetails.total}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Occupancy:</span>
                      <p className="text-gray-900">{selectedAccommodationForDetails.occupied}/{selectedAccommodationForDetails.total}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="text-gray-900">{selectedAccommodationForDetails.description}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Amenities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAccommodationForDetails.amenities.map((amenity: string) => (
                          <span key={amenity} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Bookings</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {(() => {
                      const accommodationBookings = getAccommodationBookings(selectedAccommodationForDetails.id);
                      return accommodationBookings.length === 0 ? (
                        <div className="p-8 text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          <p className="text-gray-500">No bookings yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nights</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Requests</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {accommodationBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
                                      <div className="text-sm text-gray-500">{booking.studentEmail}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {booking.checkInDate}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {booking.checkOutDate}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {booking.numberOfNights}
                                  </td>
                                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                    ₹{booking.totalAmount}
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      booking.paymentStatus === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : booking.paymentStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {booking.paymentStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500">
                                    {booking.specialRequests || 'None'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={closeAccommodationDetailsModal}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Delete Student Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={cancelDeleteStudent}
          title="Delete Student"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">
                Are you sure you want to delete <strong>"{studentToDelete?.name}"</strong>?
                This will permanently remove the student and all their associated data from the system.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={cancelDeleteStudent}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteStudent}
              >
                Delete Student
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
