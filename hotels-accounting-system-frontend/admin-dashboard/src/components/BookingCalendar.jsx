import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import "./bookingcalender.css";

const BookingCalendar = ({ roomId, selectedDate, setSelectedDate, minDate }) => {
  const [bookedRanges, setBookedRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Memoized date formatting function
  const formatDate = useCallback((date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Date normalization with proper timezone handling
  const normalizeDate = useCallback((date) => {
    // If date is string (from API), parse as local date
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      return new Date(year, month - 1, day); // Local time
    }
    
    // If Date object, reset time components
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Fetch booked dates with error handling
  const fetchBookedDates = useCallback(async () => {
    if (!roomId) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.get(
        `http://localhost:8000/api/bookings/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response?.data?.bookings) {
        throw new Error("Invalid response structure");
      }

      const ranges = response.data.bookings.map(booking => ({
        start: normalizeDate(booking.check_in_date),
        end: normalizeDate(booking.check_out_date)
      }));
      
      setBookedRanges(ranges);
    } catch (err) {
      console.error("Booking dates fetch error:", err);
      setError(err.response?.data?.message || "Failed to load booking data");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, normalizeDate]);

  // Click outside handler
  const handleClickOutside = useCallback((event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setShowCalendar(false);
    }
  }, []);

  // Date selection handler
  const handleDateChange = useCallback((date) => {
    const normalizedDate = normalizeDate(date);
    setSelectedDate(normalizedDate);
    setShowCalendar(false);
  }, [setSelectedDate, normalizeDate]);

  // Date validation
  const isDateBooked = useCallback((date) => {
    const testDate = normalizeDate(date);
    return bookedRanges.some(({ start, end }) => 
      testDate >= start && testDate <= end
    );
  }, [bookedRanges, normalizeDate]);

  useEffect(() => {
    fetchBookedDates();
  }, [fetchBookedDates]);

  useEffect(() => {
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar, handleClickOutside]);

  return (
    <div className="booking-calendar-container" ref={calendarRef}>
    <div className="date-picker-trigger" onClick={() => setShowCalendar(!showCalendar)}>
      <FaCalendarAlt className="calendar-icon" />
      <span className="selected-date">
        {selectedDate ? formatDate(selectedDate) : "Select date"}
      </span>
    </div>
  
    {showCalendar && (
      <div className="calendar-popup">
          {isLoading ? (
            <div className="loading-overlay">
              <p>Loading availability...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              {error} <button onClick={fetchBookedDates}>Retry</button>
            </div>
          ) : (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={minDate || normalizeDate(new Date())}
              filterDate={date => !isDateBooked(date)}
              inline
              popperPlacement="bottom-start"
              dateFormat="yyyy-MM-dd"
              dayClassName={date => 
                isDateBooked(date) ? "booked-day" : undefined
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

BookingCalendar.propTypes = {
  roomId: PropTypes.string.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date)
};

export default BookingCalendar;