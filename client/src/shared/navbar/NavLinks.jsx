import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const links = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Customers', href: '#customers' },
  { name: 'FAQ', href: '#faq' },
];

const NavLinks = ({ className = "", onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (e, href) => {
    e.preventDefault();
    const id = href.replace('#', '');
    
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + href);
    }
    
    if (onItemClick) onItemClick();
  };

  return (
    <ul className={`flex ${className}`}>
      {links.map((link, index) => (
        <li 
          key={link.name}
          className={`${className.includes('flex-col') ? 'w-full border-b border-gray-50 py-2 first:border-t' : ''}`}
        >
          <a
            href={link.href}
            onClick={(e) => handleScroll(e, link.href)}
            className={`text-[#4F4F4F] hover:text-Primary transition-colors duration-300 font-medium text-sm lg:text-base cursor-pointer block ${
              className.includes('flex-col') ? 'py-2' : ''
            }`}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
