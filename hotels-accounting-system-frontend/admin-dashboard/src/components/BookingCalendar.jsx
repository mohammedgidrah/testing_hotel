import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

const BookingCalendar = ({ roomId, selectedDate, setSelectedDate, minDate }) => {
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

  // Format the date using local time values
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Parse the date manually if it's a string, so it's interpreted in local time
  const normalizeDate = (date) => {
    let d;
    if (typeof date === "string") {
      const [year, month, day] = date.split("-").map(Number);
      d = new Date(year, month - 1, day); // Create date in local timezone
    } else {
      d = new Date(date);
    }
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleDateChange = (date) => {
    const normalizedDate = normalizeDate(date);
    setSelectedDate(normalizedDate); // Update the selected date
    setTimeout(() => {
      setShowCalendar(false); // Close the calendar after state update
    }, 0);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        border: "1px solid #dee2e6",
        borderRadius: "0.375rem",
        padding: ".375rem .75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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

      {/* Selected Date Display */}
      <div style={{ marginTop: "5px" }}>
        {selectedDate ? (
          <span>{formatDate(selectedDate)}</span>
        ) : (
          <span>No date selected</span>
        )}
      </div>

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
              onChange={handleDateChange}
              minDate={minDate || new Date()} // Use passed minDate or default to today
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
