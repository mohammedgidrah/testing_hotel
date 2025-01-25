import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enDashboard from "../../locales/en/dashboard.json";
import enBookings from "../../locales/en/bookings.json";
import enExpenses from "../../locales/en/Expenses.json";
import enFinancialReports from "../../locales/en/FinancialReports.json";
import enPayments from "../../locales/en/Payments.json";
import enGuests from "../../locales/en/Guests.json";
import enRooms from "../../locales/en/Rooms.json";
import arDashboard from "../../locales/ar/dashboard.json";
import arBookings from "../../locales/ar/bookings.json";
import arExpenses from "../../locales/ar/Expenses.json";
import arFinancialReports from "../../locales/ar/FinancialReports.json";
import arPayments from "../../locales/ar/Payments.json";
import arGuests from "../../locales/ar/Guests.json";
import arRooms from "../../locales/ar/Rooms.json";



i18n.use(initReactI18next).init({
  resources: {
    en: {
      dashboard: enDashboard,
      bookings: enBookings,
      expenses: enExpenses,
      financialReports: enFinancialReports,
      payments: enPayments,
      guests: enGuests,
      rooms: enRooms
    },
    ar: {
      dashboard: arDashboard,
      bookings: arBookings,
      expenses: arExpenses,
      financialReports: arFinancialReports ,
      payments: arPayments,
      guests: arGuests,
      rooms: arRooms
    },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already handles escaping
  },
});

export default i18n;
