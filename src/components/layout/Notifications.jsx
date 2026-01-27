import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const colorStyles = {
  success: {
    border: 'border-accent-success/50',
    bg: 'bg-gradient-to-r from-accent-success/15 to-accent-success/5',
    text: 'text-accent-success',
    shadow: 'shadow-[0_8px_32px_rgba(34,197,94,0.25)]',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    ring: 'ring-1 ring-accent-success/20'
  },
  error: {
    border: 'border-accent-danger/50',
    bg: 'bg-gradient-to-r from-accent-danger/15 to-accent-danger/5',
    text: 'text-accent-danger',
    shadow: 'shadow-[0_8px_32px_rgba(239,68,68,0.25)]',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    ring: 'ring-1 ring-accent-danger/20'
  },
  warning: {
    border: 'border-accent-warning/50',
    bg: 'bg-gradient-to-r from-accent-warning/15 to-accent-warning/5',
    text: 'text-accent-warning',
    shadow: 'shadow-[0_8px_32px_rgba(245,158,11,0.25)]',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    ring: 'ring-1 ring-accent-warning/20'
  },
  info: {
    border: 'border-accent-secondary/50',
    bg: 'bg-gradient-to-r from-accent-secondary/15 to-accent-secondary/5',
    text: 'text-accent-secondary',
    shadow: 'shadow-[0_8px_32px_rgba(6,182,212,0.25)]',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    ring: 'ring-1 ring-accent-secondary/20'
  }
};

const spring = {
  type: "spring",
  stiffness: 400,
  damping: 25
};

export const Notifications = () => {
  const { notifications, dismissNotification } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => {
          const Icon = icons[notification.type];
          const styles = colorStyles[notification.type];

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              exit={{
                opacity: 0,
                x: 100,
                scale: 0.8,
                rotateY: -20,
                transition: { duration: 0.2 }
              }}
              transition={spring}
              className={`
                pointer-events-auto flex items-start gap-3.5 px-4 py-3.5
                rounded-xl border backdrop-blur-xl min-w-[320px] max-w-[420px]
                ${styles.border} ${styles.bg} ${styles.shadow} ${styles.ring}
                bg-surface-800/90 relative overflow-hidden
              `}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className={`absolute inset-0 opacity-50 ${styles.bg}`} />

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative z-10"
              >
                <div className={`p-2 rounded-lg ${styles.bg} ${styles.glow}`}>
                  <Icon className={`w-5 h-5 ${styles.text} drop-shadow-lg`} />
                </div>
              </motion.div>

              <div className="flex-1 relative z-10">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm font-medium text-text-primary leading-relaxed"
                >
                  {notification.message}
                </motion.p>
              </div>

              <motion.button
                onClick={() => dismissNotification(notification.id)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200
                          ${styles.text} relative z-10 flex-shrink-0`}
              >
                <X className="w-4 h-4" />
              </motion.button>

              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${styles.bg}`}
                onAnimationComplete={() => dismissNotification(notification.id)}
              />

              <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full ${styles.bg} blur-3xl opacity-30`} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
