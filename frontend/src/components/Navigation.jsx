import React, { useState } from 'react';
import { categories } from '../data/siteContent';
import { ChevronRight } from 'lucide-react';

const Navigation = () => {
  const [activeNav, setActiveNav] = useState('Home');
  const [showDropdown, setShowDropdown] = useState(true);

  const navItems = [
    'Home',
    'Online Exhibition',
    'Scholarships',
    'Self-financed Programs',
    'Universities',
    'Apply',
    'About Us'
  ];

  return (
    <div className="bg-white border-b border-gray-100 relative z-40">
      <div className="max-w-[1400px] mx-auto flex">
        {/* Programs Menu */}
        <div 
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
        >
          <button 
            className="bg-[#7b5acd] text-white px-8 py-3 font-medium flex items-center gap-2 w-[200px] justify-center"
          >
            Programs
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              onClick={() => setActiveNav(item)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeNav === item
                  ? 'text-[#7b5acd]'
                  : 'text-gray-700 hover:text-[#7b5acd]'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* Dropdown Menu - Positioned below the nav bar */}
      {showDropdown && (
        <div className="absolute left-0 top-full w-full max-w-[1400px] mx-auto" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <div className="w-[200px] bg-white shadow-lg border border-gray-100 z-50">
            {categories.map((category, index) => (
              <a
                key={index}
                href="#"
                className="flex items-center justify-between px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#7b5acd] transition-colors text-sm border-b border-gray-50 last:border-none"
              >
                {category}
                <ChevronRight size={14} className="text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
