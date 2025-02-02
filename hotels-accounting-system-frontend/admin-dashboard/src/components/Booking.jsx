import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";

const BookingModal = ({ show, handleClose, room, guests, handleBooking, setRoom }) => {
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedGuestId) {
      fetch(`http://localhost:8000/api/guests/${selectedGuestId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch guest details");
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            setGuestEmail(data.email || "");
            setGuestPhone(data.phone_number || "");
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          setError(error.message);
        });
    } else {
      setGuestEmail("");
      setGuestPhone("");
    }
  }, [selectedGuestId]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      if (isNaN(checkIn) || isNaN(checkOut)) {
        setError("Invalid date format.");
        setIsRoomAvailable(false);
        return;
      }

      if (checkIn >= checkOut) {
        setError("Check-out date must be after the check-in date.");
        setIsRoomAvailable(false);
        return;
      }

      setIsRoomAvailable(true);
      const diffTime = checkOut - checkIn;
      const diffDays = diffTime / (1000 * 3600 * 24);
      const total = room?.price_per_night * diffDays || 0;
      setTotalAmount(total);
      setError("");
    }
  }, [checkInDate, checkOutDate, room]);

  const handleBookingClick = () => {
    setIsLoading(true);
    setError("");
  
    if (!checkInDate || !checkOutDate) {
      setError("Please provide check-in date and check-out date.");
      setIsLoading(false);
      return;
    }
  
    if (!selectedGuestId) {
      setError("Please select a guest.");
      setIsLoading(false);
      return;
    }
  
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError("Check-out date must be after the check-in date.");
      setIsLoading(false);
      return;
    }
  
    const bookingDetails = {
      guest_id: selectedGuestId,
      room_id: room.id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      email: guestEmail,
      phone_number: guestPhone,
      payment_status: paymentStatus,
      total_amount: totalAmount,
    };
    
    console.log(bookingDetails); // Add this line to check the data being sent
    
  
    fetch("http://localhost:8000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  
        // Step 2: Update the room status to "occupied"
        return fetch(`http://localhost:8000/api/rooms/${room.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "occupied" })
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error updating room status");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Room status updated successfully:", data);
  
        // Notify parent component and close the modal
        handleBooking(bookingDetails); // Pass booking details to the parent
        handleClose();
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message || "Failed to create booking. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book Room: {room?.room_number || "Room"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
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

          {selectedGuestId && (
            <>
              <p className="p-1">
                <strong>Email:</strong> {guestEmail}
              </p>
              <p className="p-1">
                <strong>Phone Number:</strong> {guestPhone}
              </p>
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

        {error && <p style={{ color: "red" }}>{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        {totalAmount > 0 && (
          <p>
            <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
          </p>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={handleBookingClick}
          disabled={isLoading}
        >
          {isLoading ? "Booking..." : "Book Now"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingModal;

