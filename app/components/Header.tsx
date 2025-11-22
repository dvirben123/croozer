import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";
import FacebookLoginButton from "./FacebookLoginButton";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onOpenContactDialog: () => void;
}

export function Header({ onOpenContactDialog }: HeaderProps) {
  const { isAuthenticated, user } = useAuth();
  return (
    <motion.header
      className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Right side */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <img
              src="/assets/4d243741b97f4cb27d5e541b25efddf4d20bc4a9.png"
              alt="דביר בן ישי Croozer Logo"
              className="h-8 sm:h-10 w-auto"
            />
          </motion.div>

          {/* Navigation - Left side */}
          <motion.div
            className="flex items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Facebook Login - only show when not logged in */}
            {!isAuthenticated && (
              <div className="hidden sm:block">
                <FacebookLoginButton />
              </div>
            )}

            {/* Dashboard Link - only show when logged in */}
            {isAuthenticated && user && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary border border-primary/30 hover:border-primary/50 transition-all duration-300 text-sm font-medium"
              >
                דשבורד
              </Link>
            )}

            {/* User info when logged in on mobile */}
            {isAuthenticated && user && (
              <div className="sm:hidden flex items-center gap-2">
                <img
                  src={user.image || undefined}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-xs text-primary">{user.name}</span>
              </div>
            )}

            {/* WhatsApp Icon */}
            <motion.button
              onClick={onOpenContactDialog}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-all duration-300 border border-primary/30 hover:border-primary/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </motion.button>

            {/* Email Icon */}
            <motion.button
              onClick={onOpenContactDialog}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-all duration-300 border border-primary/30 hover:border-primary/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
