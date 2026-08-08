import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextProps {
  html?: string | null;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

/**
 * Renders rich text (HTML) coming from the admin rich text editors.
 * Falls back gracefully to plain text content.
 */
const RichText: React.FC<RichTextProps> = ({ html, className = '', dir }) => {
  if (!html) return null;

  return (
    <div
      dir={dir}
      className={`prose prose-sm max-w-none prose-headings:text-inherit prose-p:my-2 prose-a:text-odoo-purple ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
};

export default RichText;
