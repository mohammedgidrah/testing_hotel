import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function Header({ title }) {
  const { t, i18n } = useTranslation("dashboard");
  
  // Get the saved language from localStorage or default to i18n's language
  const storedLang = localStorage.getItem("lang") || i18n.language;
  const [lang, setLang] = useState(storedLang);

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang); // Change the language
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr'); // Set text direction
      localStorage.setItem("lang", lang); // Store language in localStorage
    }
  }, [lang, i18n]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <header className='flex items-center justify-between bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700'>
      <div className='flex-1 max-w-7xl mx-auto py-4 px-4 lg:px-8'>
        <h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
      </div>
      <div className='flex items-center space-x-4 gap-4'>
        {/* Language Switcher */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className='text-white bg-gray-700 border border-gray-600 p-2 rounded-lg'
          aria-label="Select language"
        >
          <option value='en'>English</option>
          <option value='ar'>العربية</option>
        </select>

        {/* Logout Button */}
        <button
          className='text-white p-2 rounded-lg border border-gray-600 hover:bg-gray-800 bg-gray-700'
          onClick={handleLogout}
          aria-label="Logout"
        >
          {t('logout')}
        </button>
      </div>
    </header>
  );
}

export default Header;
