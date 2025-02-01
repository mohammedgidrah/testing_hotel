import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";

const BookingModal = ({ show, handleClose, room, guests, handleBooking }) => {
  const [selectedGuestId, setSelectedGuestId] = useState(""); // ID of the selected guest
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("Pending"); // Payment status
  const [totalAmount, setTotalAmount] = useState(0); // Total amount for the booking

  // Fetch guest details when a guest is selected
  useEffect(() => {
    if (selectedGuestId) {
      // Fetch guest details from the Laravel API
      fetch(`http://localhost:8000/api/guests/${selectedGuestId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch guest details");
          }
          return response.json();
        })
        .then((data) => {
          if (data.email && data.phone_number) {
            setGuestEmail(data.email);
            setGuestPhone(data.phone_number);
          } else {
            setGuestEmail("");
            setGuestPhone("");
          }
        })
        .catch((error) => {
          console.error("Error fetching guest details:", error);
        });
    } else {
      setGuestEmail("");
      setGuestPhone("");
    }
  }, [selectedGuestId]);

  // Check room availability based on the selected check-in/check-out dates
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      // Here we can check for availability by comparing the dates to room bookings.
      // You should ideally call an API to check room availability, for now we assume the room is available.
      setIsRoomAvailable(true);  // Assume the room is available, implement actual check if necessary.

      // Calculate total amount based on room price and duration
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = checkOut - checkIn; // Difference in milliseconds
      const diffDays = diffTime / (1000 * 3600 * 24); // Convert to days

      // Assuming room.price holds the price per night
      const total = room.price * diffDays;
      setTotalAmount(total);
    }
  }, [checkInDate, checkOutDate, room]);

  const handleBookingClick = () => {
    if (!selectedGuestId || !checkInDate || !checkOutDate) {
      alert("Please select a guest, check-in date, and check-out date.");
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert("Check-out date must be after the check-in date.");
      return;
    }

    const bookingDetails = {
      guest_id: selectedGuestId,
      room_id: room.id, // Assuming the room has an 'id' property
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      email: guestEmail,
      phone_number: guestPhone,
      payment_type: "Cash",
      payment_status: paymentStatus, // Adding payment status
      total_amount: totalAmount, // Adding total amount
    };

    // Send booking details to the Laravel API
    fetch("http://localhost:8000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(bookingDetails),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error creating booking");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Booking created successfully:", data);
          handleBooking(data); // Call the parent component to update the state
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      

    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book Room: {room?.room_number || "Room"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="guestName">
            <Form.Label>Guest Name</Form.Label>
            <Form.Control
              as="select"
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
            >
              <option value="">Select Guest</option>
              {guests?.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {`${guest.first_name} ${guest.last_name}`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* Conditionally render email and phone if a guest is selected */}
          {selectedGuestId && (
            <>
              <p className="p-1"><strong>Email:</strong> {guestEmail}</p>
              <p className="p-1"><strong>Phone Number:</strong> {guestPhone}</p>
            </>
          )}

          <Form.Group controlId="checkInDate">
            <Form.Label>Check-in Date</Form.Label>
            <Form.Control
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="checkOutDate">
            <Form.Label>Check-out Date</Form.Label>
            <Form.Control
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
            />
          </Form.Group>

          {/* Display room availability status */}
          {!isRoomAvailable && <p style={{ color: "red" }}>Room is not available for the selected dates.</p>}

          {/* Display total amount */}
          {totalAmount > 0 && <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>}

          {/* Payment status */}
          <Form.Group controlId="paymentStatus">
            <Form.Label>Payment Status</Form.Label>
            <Form.Control
              as="select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleBookingClick}>
          Book Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingModal;
