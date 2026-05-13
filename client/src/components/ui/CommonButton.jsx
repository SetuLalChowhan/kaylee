import React from 'react';
import { Link } from 'react-router-dom';

const CommonButton = ({ type = 'button', path = '#', className = '', children, onClick, ...props }) => {
  const commonClasses = `inline-flex px-4 items-center justify-center transition-all duration-300 active:scale-95 ${className}`;

  if (type === 'link') {
    return (
      <Link to={path} className={commonClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={commonClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default CommonButton;
