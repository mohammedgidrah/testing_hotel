import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import "./bookingcalender.css";

const BookingCalendar = ({
  roomId,
  selectedDate,
  setSelectedDate,
  minDate,
}) => {
  const [bookedRanges, setBookedRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Memoized date formatting function
  const formatDate = useCallback((date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Date normalization with proper timezone handling
  const normalizeDate = useCallback((date) => {
    if (!date) return null;
    if (typeof date === "string") {
      const [year, month, day] = date.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Fetch booked dates with error handling
  const fetchBookedDates = useCallback(async () => {
    if (!roomId) {
      setIsLoading(false);
      setBookedRanges([]);
      return;
    }

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

      const ranges = response.data.bookings.map((booking) => ({
        start: normalizeDate(booking.check_in_date),
        end: normalizeDate(booking.check_out_date),
        bookingId: booking.id,
      }));

      setBookedRanges(ranges);
    } catch (err) {
      console.error("Booking dates fetch error:", err);
      setError(err.response?.data?.message || "Failed to load booking data");
      setBookedRanges([]);
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
  const handleDateChange = useCallback(
    (date) => {
      // Fix for the date issue: ensure the date is correctly set with proper day
      const selectedDay = date.getDate();
      const selectedMonth = date.getMonth();
      const selectedYear = date.getFullYear();

      // Create a new date object at noon to avoid timezone issues
      const correctedDate = new Date(
        Date.UTC(selectedYear, selectedMonth, selectedDay, 12, 0, 0)
      );

      setSelectedDate(correctedDate);
      setShowCalendar(false);
    },
    [setSelectedDate]
  );

  // Date validation - check if a date is booked
const isDateBooked = useCallback(
  (date) => {
    if (!date || bookedRanges.length === 0) return false;

    const testDate = normalizeDate(date);

    const ranges = bookedRanges
      .filter(({ start, end }) => start && end)
      .map(({ start, end }) => ({
        start: normalizeDate(start),
        end: normalizeDate(end),
      }))
      .sort((a, b) => a.start - b.start);

    // Check if date is inside any booked range
    const isInRange = ranges.some(({ start, end }) => {
      return testDate >= start && testDate <= end;
    });
    if (isInRange) return true;

    // Check for isolated single day gap between bookings
    for (let i = 0; i < ranges.length - 1; i++) {
      const currentEnd = ranges[i].end;
      const nextStart = ranges[i + 1].start;

      const gap = (nextStart - currentEnd) / (1000 * 60 * 60 * 24); // gap in days

      if (gap === 1) { // gap=2 means exactly one day in the middle (because currentEnd and nextStart are inclusive booking days)
        const middleDate = new Date(currentEnd);
        middleDate.setDate(middleDate.getDate() + 1); // the isolated day

        if (testDate.getTime() === middleDate.getTime()) {
          return true; // Disable isolated single date between bookings
        }
      }
    }

    return false;
  },
  [bookedRanges, normalizeDate]
);
const isDateDisabled = useCallback(
  (date) => {
    if (!date || bookedRanges.length === 0) return false;

    const testDate = normalizeDate(date);

    const ranges = bookedRanges
      .filter(({ start, end }) => start && end)
      .map(({ start, end }) => ({
        start: normalizeDate(start),
        end: normalizeDate(end),
      }))
      .sort((a, b) => a.start - b.start);

    for (let i = 0; i < ranges.length - 1; i++) {
      const currentEnd = ranges[i].end;
      const nextStart = ranges[i + 1].start;

      const gap = (nextStart - currentEnd) / (1000 * 60 * 60 * 24);

      if (gap === 2) {
        const middleDate = new Date(currentEnd);
        middleDate.setDate(middleDate.getDate() + 1);

        if (testDate.getTime() === middleDate.getTime()) {
          return true; // disable this isolated day
        }
      }
    }
    return false;
  },
  [bookedRanges, normalizeDate]
);


  // Convert displayed date back to correct format
  const displayDate = useCallback((date) => {
    if (!date) return null;

    // Ensure we're showing the correct day by creating a new date object
    const d = new Date(date);
    // No timezone adjustments since we want to display the actual day
    return d;
  }, []);

  // Reset state when roomId changes
  useEffect(() => {
    if (roomId) {
      fetchBookedDates();
    } else {
      setIsLoading(false);
      setBookedRanges([]);
      setError("");
    }
  }, [roomId, fetchBookedDates]);

  // Add event listener for click outside
  useEffect(() => {
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar, handleClickOutside]);

  return (
    <div className="booking-calendar-container" ref={calendarRef}>
      <div
        className="date-picker-trigger"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <div className="date-display">
          <FaCalendarAlt className="calendar-icon" />
          <span className="selected-date">
            {selectedDate
              ? formatDate(displayDate(selectedDate))
              : "Select date"}
          </span>
        </div>
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
              selected={selectedDate ? displayDate(selectedDate) : null}
              onChange={handleDateChange}
              minDate={minDate ? displayDate(minDate) : new Date()}
  filterDate={(date) => !isDateBooked(date) && !isDateDisabled(date)}  // disable both booked and isolated disabled dates
              inline
              popperPlacement="bottom-start"
              dateFormat="yyyy-MM-dd"
              dayClassName={(date) =>
                isDateBooked(date) ? "react-datepicker__day--booked" : undefined
              }
              calendarClassName="custom-datepicker"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              // Explicitly use UTC=false to prevent date shifting
              utcOffset={0}
              timeZone=""
            />
          )}
        </div>
      )}
    </div>
  );
};

BookingCalendar.propTypes = {
  roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date),
};

export default BookingCalendar;
