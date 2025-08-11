'use client';

import Link from 'next/link';
import { useEnhancedTopLoaderNavigation } from '@/hooks/useEnhancedTopLoaderNavigation';
import { ReactNode } from 'react';

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  [key: string]: any;
}

const OptimizedLink = ({ 
  href, 
  children, 
  className, 
  onClick, 
  replace = false,
  scroll = true,
  shallow = false,
  ...props 
}: OptimizedLinkProps) => {
  const { navigateWithOptimization } = useEnhancedTopLoaderNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }
    
    navigateWithOptimization(href, { replace, scroll, shallow });
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default OptimizedLink;

