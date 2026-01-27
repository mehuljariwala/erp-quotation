import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-accent-primary to-teal-400 text-surface-900 hover:opacity-90',
  secondary: 'bg-surface-600 text-text-primary hover:bg-surface-500 border border-surface-400',
  danger: 'bg-accent-danger/20 text-accent-danger hover:bg-accent-danger/30 border border-accent-danger/30',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-600',
  success: 'bg-accent-success/20 text-accent-success hover:bg-accent-success/30 border border-accent-success/30'
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base'
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  shortcut,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-150 focus:outline-none focus:ring-2
        focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-surface-800
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4" />}
      {shortcut && <kbd className="kbd ml-1">{shortcut}</kbd>}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
