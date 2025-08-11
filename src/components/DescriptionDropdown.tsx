"use client";
import React, { useState } from 'react';

interface DescriptionDropdownProps {
  title?: string;
  content?: string;
  defaultOpen?: boolean;
  className?: string;
  demoMode?: boolean;
}

const DescriptionDropdown: React.FC<DescriptionDropdownProps> = ({
  title = "Description",
  content,
  defaultOpen = false,
  className = "",
  demoMode = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Sample rich text content for demo
  const demoContent = `
    <h2>Product Features</h2>
    <p>This is a <strong>high-quality product</strong> with amazing features:</p>
    <ul>
      <li><em>Premium quality materials</em></li>
      <li>Durable construction</li>
      <li>Easy to maintain</li>
    </ul>
    <h3>Technical Specifications</h3>
    <p>Here are the key specifications:</p>
    <ul>
      <li>Weight: <strong>2.5 kg</strong></li>
      <li>Dimensions: 10" x 8" x 4"</li>
      <li>Material: <u>Stainless Steel</u></li>
    </ul>
    <blockquote>
      "This product exceeds all expectations and provides excellent value for money."
    </blockquote>
    <p>For more information, visit our <a href="#" style="color: #2563eb;">product page</a>.</p>
  `;

  const displayContent = demoMode && !content ? demoContent : content;

  // Debug logging
  console.log('DescriptionDropdown props:', {
    title,
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100),
    demoMode,
    displayContentLength: displayContent?.length || 0,
    displayContentPreview: displayContent?.substring(0, 100)
  });

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
      >
        <h3 className="text-lg font-medium text-black">{title}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-4 py-4 border-t border-gray-200">
          {displayContent ? (
            <div 
              className="rich-text-content text-black leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayContent }}
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionDropdown;