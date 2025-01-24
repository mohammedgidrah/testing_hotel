import React from 'react';
import { useTranslation } from 'react-i18next';

function Header({ title }) {
  const { t, i18n } = useTranslation("dashboard");

  // Change language function
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang); // Change the language
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr'); // Set the text direction based on language
  };

  return (
    <header className='flex items-center justify-between bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700'>
      <div className='flex-1 max-w-7xl mx-auto py-4 px-4 lg:px-8'>
        <h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
      </div>
      <div className='flex items-center space-x-4'>
        {/* Language Switcher as a Select Dropdown */}
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          className='text-white bg-gray-700 border border-gray-600 p-2 rounded-lg'>
          <option value='en'>English</option>
          <option value='ar'>العربية</option>
        </select>

        {/* Logout Button */}
        <button
          className='text-white p-4 rounded-lg border border-gray-600 m-4 hover:bg-gray-800 bg-gray-700'
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
        >
          {t('logout')}
        </button>
      </div>
    </header>
  );
}

export default Header;
