import React from 'react';
import { BuhLogo } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4">
        <BuhLogo className="h-12 w-12 sm:h-14 sm:w-14" />
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700">
          Báo cáo Giao ban Khoa Ngoại
        </h1>
      </div>
    </header>
  );
};

export default Header;
