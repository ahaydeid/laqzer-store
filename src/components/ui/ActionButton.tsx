import React from 'react';
import Link from 'next/link';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'edit' | 'delete' | 'detail';
  href?: string;
  children?: React.ReactNode;
}

export function ActionButton({
  variant = 'detail',
  href,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  let baseStyles = "";
  
  if (variant === 'edit') {
    baseStyles = "w-9 h-9 rounded-lg flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white border-none transition-all cursor-pointer";
  } else if (variant === 'delete') {
    baseStyles = "w-9 h-9 rounded-lg flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white border-none transition-all cursor-pointer";
  } else { // 'detail'
    baseStyles = "w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border-none transition-all cursor-pointer";
  }

  const combinedClassName = `${baseStyles} ${className}`;

  if (href) {
    return (
      <Link 
        href={href} 
        className={combinedClassName}
        {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
}

export default ActionButton;
