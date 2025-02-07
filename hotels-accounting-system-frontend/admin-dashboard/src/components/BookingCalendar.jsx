import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

const BookingCalendar = ({ roomId, selectedDate, setSelectedDate }) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!roomId) return;
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `http://localhost:8000/api/bookings/${roomId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.data || !Array.isArray(response.data.bookings)) {
          throw new Error("Invalid API response format");
        }

        const bookedRanges = response.data.bookings.map((booking) => ({
          start: new Date(booking.check_in_date),
          end: new Date(booking.check_out_date),
        }));
        setBookedDates(bookedRanges);
      } catch (err) {
        console.error("Error fetching booked dates:", err);
        setError("Failed to load booked dates.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookedDates();
  }, [roomId]);

  const isDateBooked = (date) => {
    return bookedDates.some(({ start, end }) => date >= start && date <= end);
  };

  const handleClickOutside = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setShowCalendar(false);
    }
  };

  useEffect(() => {
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        border: "1px solid #dee2e6",
        borderRadius: "0.375rem",
        padding: ".375rem .75rem",
      }}
    >
      {/* Calendar Icon */}
      <button
        type="button"
        onClick={() => setShowCalendar((prev) => !prev)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.2rem",
          marginRight: "10px",
        }}
      >
        <FaCalendarAlt />
      </button>

      {/* Calendar Popup */}
      {showCalendar && (
        <div
          ref={calendarRef}
          style={{
            position: "absolute",
            zIndex: 1000,
            background: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          {isLoading ? (
            <p className="loading-message">Loading booked dates...</p>
          ) : error ? (
            <p className="error-message" style={{ color: "red" }}>
              {error}
            </p>
          ) : (
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
              }}
              minDate={new Date()}
              filterDate={(date) => !isDateBooked(date)}
              dateFormat="yyyy-MM-dd"
              inline
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
