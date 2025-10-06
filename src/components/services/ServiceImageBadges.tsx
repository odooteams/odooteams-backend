
import React from 'react';

interface ServiceImageBadgesProps {
  category: string;
  cost?: string;
}

const ServiceImageBadges: React.FC<ServiceImageBadgesProps> = ({ category, cost }) => {
  // Get category color using same function as in ProjectsList
  const getCategoryColor = (category: string): string => {
    const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500',
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
      'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500'
    ];
    return colors[hash % colors.length];
  };

  // Cost label styling (colored purple/orange gradient)
  const costLabelBg = "bg-gradient-to-r from-odoo-purple via-orange-400 to-odoo-magenta text-white shadow";

  return (
    <>
      {/* Category badge on top right */}
      <span className="absolute top-4 right-4 left-reverse:rtl bg-odoo-purple text-white px-3 py-1 text-sm rounded">
        {category}
      </span>
      
      {/* Category badge on bottom left of image */}
      <span
        className={`absolute left-2 bottom-2 px-3 py-1 rounded-md text-xs font-semibold text-white ${getCategoryColor(category)}`}
      >
        {category}
      </span>
    </>
  );
};

export default ServiceImageBadges;
