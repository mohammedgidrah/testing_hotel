import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import axios from "axios";
import StatCard from "../components/StatCard";
import { Zap, Users, User, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import BookingModal from "../components/Booking";

export default function Reception() {
  const { t } = useTranslation("reception");
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/rooms/${roomId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchRooms();
    } catch (error) {
      console.error("Failed to update room status:", error);
    }
  };
  const handleBooking = () => {
    if (selectedRoom) {
      openModal(selectedRoom);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("reception")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4">
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
          name={t("OccupiedRooms")}
          value={stats.occupied}
          icon={Zap}
          color="red"
        />
        <StatCard
          name={t("MaintenanceRooms")}
          value={stats.maintenance}
          icon={Wrench}
          color="orange"
        />
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {rooms.map((room) => (
          <StatCard
            key={room.id}
            name={t("room") + " " + room.room_number}
            value={t(room.status)}
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
