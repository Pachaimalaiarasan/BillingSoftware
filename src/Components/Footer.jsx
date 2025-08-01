import React from 'react';

const Footer = () => {
  const date = new Date();

  return (
    <footer className="bg-black text-yellow-400 w-full py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center">
        <p className="text-sm sm:text-base font-medium">
          Design by <span className="text-white font-semibold">Arasan</span>
        </p>
        <p className="text-sm sm:text-base font-medium mt-2 sm:mt-0 sticky bottom-0">
          &copy; {date.getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
