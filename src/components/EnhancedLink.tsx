'use client';

import React from 'react';
import Link from 'next/link';

interface EnhancedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  [key: string]: any; // Allow other props to pass through
}

const EnhancedLink: React.FC<EnhancedLinkProps> = ({
  href,
  children,
  className = '',
  onClick,
  prefetch = true,
  replace = false,
  scroll = true,
  shallow = false,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      // Ensure this link prefetches when visible for faster nav
      data-prefetch="true"
      {...props}
    >
      {children}
    </Link>
  );
};

export default EnhancedLink;
