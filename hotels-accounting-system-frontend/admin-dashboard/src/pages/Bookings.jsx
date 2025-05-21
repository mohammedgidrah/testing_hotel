import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import axios from "axios";
import { Users, User, School, Book } from "lucide-react";
import BookingsTable from "../components/Bookings/BookingsTable";
import { useTranslation } from "react-i18next";

function Bookings() {
  const { t } = useTranslation("bookings");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalBookingsToday, setTotalBookingsToday] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;

    axios
      .get("http://127.0.0.1:8000/api/bookings")
      .then((response) => {
        setTotalBookings(response.data.length);
        setBookings(response.data);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));

    axios
      .get("http://127.0.0.1:8000/api/guests")
      .then((response) => setTotalGuests(response.data.length))
      .catch(() => setError("Failed to load data"));

    axios
      .get("http://127.0.0.1:8000/api/rooms")
      .then((response) => setTotalRooms(response.data.length))
      .catch(() => setError("Failed to load data"));

    axios
      .get("http://127.0.0.1:8000/api/bookingsQuery/today")
      .then((response) => {
        setTotalBookingsToday(response.data?.length || 0);
      })
      .catch(() => setError("Failed to load data"));
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("title")} />
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 m-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard
              name={t("Rooms")}
              value={totalRooms}
              icon={School}
              color="#34d399"
            />
            <StatCard
              name={t("title")}
              value={totalBookings}
              icon={Users}
              color="#34d399"
            />
            <StatCard
              name={t("BookingsToday")}
              value={totalBookingsToday}
              icon={Book}
              color="#34d399"
            />
            <StatCard
              name={t("TotalGuests")}
              value={totalGuests}
              icon={User}
              color="#34d399"
            />
          </motion.div>
          <BookingsTable />
        </>
      )}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ direction: "ltr" }}
        >
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl text-white mb-4">{t("AreYouSure")}</h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
