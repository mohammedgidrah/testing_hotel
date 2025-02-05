import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import "./BookingCalendar.css";  // Import your custom CSS file

const BookingCalendar = ({ roomId, selectedDate, setSelectedDate }) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
 
  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!roomId) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(`http://localhost:8000/api/bookings/${roomId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.data || !Array.isArray(response.data.bookings)) {
          throw new Error("Invalid API response format");
        }

        const bookedRanges = response.data.bookings.map(booking => ({
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

  return (
    <div>
      {isLoading && <p className="loading-message">Loading booked dates...</p>}
      {error && <p className="error-message">{error}</p>}

      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        minDate={new Date()}
        filterDate={(date) => !isDateBooked(date)}
        dateFormat="yyyy-MM-dd"
        inline
        className="custom-datepicker"  // Apply custom class
      />
    </div>
  );
};

export default BookingCalendar;
