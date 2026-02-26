"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

interface ProfilePageProps {
  session: Session;
}

export default function ProfilePage({ session }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session.user?.name || "",
    email: session.user?.email || "",
    phone: "",
    college: "",
    year: "",
    department: "",
    interests: "",
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Profile Settings</h1>
          <p className="text-secondary-600">
            Manage your personal information and preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
              </div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-1">
                {session.user?.name || "User"}
              </h2>
              <p className="text-secondary-600 mb-4">{session.user?.email}</p>
              <div className="inline-flex px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6">
                {(session as any)?.role === "admin" ? "Administrator" : "Student"}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Profile Completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full w-[85%]" />
                </div>
                <p className="text-xs text-secondary-500">
                  Complete your profile to unlock all features
                </p>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-secondary-900">Personal Information</h3>
              <Button
                variant={isEditing ? "primary" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
                <Input
                  label="College/University"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your college name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Year of Study"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., 2nd Year, Final Year"
                />
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Interests & Skills
                </label>
                <textarea
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about your interests, skills, and what events you'd like to participate in..."
                  rows={4}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-secondary-900 ring-1 ring-inset ring-secondary-300 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 transition-all duration-200 disabled:bg-secondary-50 disabled:text-secondary-500"
                />
              </div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 pt-4 border-t border-secondary-200"
                >
                  <Button variant="primary" onClick={handleSave} className="flex-1">
                    Save Changes
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">Event Updates</p>
                  <p className="text-sm text-secondary-600">Get notified about event changes</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">Payment Reminders</p>
                  <p className="text-sm text-secondary-600">Reminders for pending payments</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">New Events</p>
                  <p className="text-sm text-secondary-600">Notifications about new events</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Security</h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2m-2 2V3" />
                </svg>
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download My Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
