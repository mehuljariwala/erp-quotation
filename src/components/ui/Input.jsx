import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  suffix,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 bg-surface-700 border border-surface-500 rounded-lg
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30
            transition-colors duration-150
            ${Icon ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error ? 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/30' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-accent-danger">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
