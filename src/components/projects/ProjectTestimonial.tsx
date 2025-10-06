
import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  position: string;
}

const ProjectTestimonial: React.FC<TestimonialProps> = ({ quote, author, position }) => {
  return (
    <section className="py-12 bg-odoo-purple text-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <svg className="w-12 h-12 mx-auto mb-6 text-odoo-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <blockquote className="text-xl md:text-2xl italic mb-6">
          "{quote}"
        </blockquote>
        <div>
          <p className="font-bold">{author}</p>
          <p className="text-sm opacity-80">{position}</p>
        </div>
      </div>
    </section>
  );
};

export default ProjectTestimonial;
