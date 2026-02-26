"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Button from "./ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur-xl border-b border-secondary-200 sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight gradient-text">
          SEMS
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-secondary-700">
          <Link href="#features" className="hover:text-secondary-900 transition-colors">Features</Link>
          <Link href="#accommodation" className="hover:text-secondary-900 transition-colors">Accommodation</Link>
          <Link href="#map" className="hover:text-secondary-900 transition-colors">Campus Map</Link>
          <Link href="#faq" className="hover:text-secondary-900 transition-colors">FAQ</Link>
        </nav>

        <div className="relative">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-secondary-200 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary-600 hidden sm:block">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-white border border-secondary-200 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
                </div>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-secondary-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-secondary-100">
                      <p className="text-sm font-medium text-secondary-900">
                        {session.user?.name || session.user?.email}
                      </p>
                      <p className="text-xs text-secondary-500 capitalize">
                        {(session as any)?.role || "Student"} Account
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href={(session as any)?.role === "admin" ? "/admin" : "/dashboard"}
                        className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signup">
                <Button variant="outline" size="sm">
                  Sign Up
                </Button>
              </Link>
              <Button
                onClick={() => setOpen((v) => !v)}
                variant="primary"
                size="sm"
              >
                Login
              </Button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-secondary-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-secondary-100">
                      <h3 className="font-semibold text-secondary-900 mb-1">Choose Login Type</h3>
                      <p className="text-xs text-secondary-600">Select your account type to continue</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/signin?mode=student"
                        className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-secondary-900">Student Login</div>
                            <div className="text-xs text-secondary-500">Access events & accommodation</div>
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/signin?mode=admin"
                        className="block px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-secondary-900">Admin Login</div>
                            <div className="text-xs text-secondary-500">Manage system & users</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



