import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import axios from "axios";
import StatCard from "../components/StatCard";
import { Zap, Users, User, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import BookingModal from "../components/Booking";

export default function Reception() {
  const { t, i18n } = useTranslation("reception");
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
  });

  useEffect(() => {
    fetchRooms();
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/guests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGuests(response.data);
    } catch (error) {
      console.error("Failed to fetch guests:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/rooms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRooms(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const calculateStats = (roomsData) => {
    const total = roomsData.length;
    const available = roomsData.filter(
      (room) => room.status === "available"
    ).length;
    const occupied = roomsData.filter(
      (room) => room.status === "occupied"
    ).length;
    const maintenance = roomsData.filter(
      (room) => room.status === "maintenance"
    ).length;
    setStats({ total, available, occupied, maintenance });
  };

  const openModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };
  const handleBooking = () => {
    if (selectedRoom) {
      openModal(selectedRoom);
    }
  };
  const filteredRooms =
  filterType === "all"
    ? rooms
    : rooms.filter((room) => room.type === filterType);


  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("reception")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4">
        <StatCard
          name={t("TotalRooms")}
          value={stats.total}
          icon={Users}
          color="#6366f1"
        />
        <StatCard
          name={t("AvailableRooms")}
          value={stats.available}
          icon={User}
          color="#34d399"
        />
        <StatCard
          name={t("MaintenanceRooms")}
          value={stats.maintenance}
          icon={Wrench}
          color="orange"
        />
      </div>
      <div className="p-4 flex items-center justify-end">
      
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded p-1 text-white   bg-gray-700 "
        >
          <option value="all">{t("All")}</option>
          {[...new Set(rooms.map((room) => room.type))].map((type) => (
            <option key={type} value={type}>
              {t(type)}
            </option>
          ))}
        </select>
        
          <label htmlFor="filterType" className="mr-2 font-semibold   "style={i18n.language === "ar" ? { marginRight: "10px" } : { marginLeft: "10px" }}>
          {t("FilterByType")}
        </label>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {filteredRooms.map((room) => (
          <StatCard
            key={room.id}
            value={
              t("room") + " " + room.room_number 
            }
            icon={
              room.status === "available"
                ? User
                : room.status === "occupied"
                ? Zap
                : Wrench
            }
            color={
              room.status === "available"
                ? "#34d399"
                : room.status === "occupied"
                ? "red"
                : "orange"
            }
            onButtonClick={
              room.status === "available" ? () => openModal(room) : null
            }
            buttonLabel={room.status === "available" ? t("BookNow") : ""}
          />
        ))}
      </motion.div>

      {/* Booking Modal */}
      <BookingModal
        show={isModalOpen}
        handleClose={closeModal}
        room={selectedRoom}
        guests={guests}
        fetchRooms={fetchRooms}
        handleBooking={handleBooking} // Add this
      />
    </div>
  );
}
