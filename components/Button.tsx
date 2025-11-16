import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }) => {
  const baseClasses = 'font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-slate-500',
    success: 'bg-success text-white hover:bg-success/90 focus:ring-success',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const fullWidthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidthClass} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;