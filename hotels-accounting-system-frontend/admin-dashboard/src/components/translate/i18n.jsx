import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enDashboard from "../../locales/en/dashboard.json";
import enBookings from "../../locales/en/bookings.json";
import enExpenses from "../../locales/en/Expenses.json";
import arDashboard from "../../locales/ar/dashboard.json";
import arBookings from "../../locales/ar/bookings.json";
import arExpenses from "../../locales/ar/Expenses.json";


i18n.use(initReactI18next).init({
  resources: {
    en: {
      dashboard: enDashboard,
      bookings: enBookings,
      expenses: enExpenses
    },
    ar: {
      dashboard: arDashboard,
      bookings: arBookings,
      expenses: arExpenses
    },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already handles escaping
  },
});

export default i18n;
