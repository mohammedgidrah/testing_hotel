import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BookingCalendar from "./BookingCalendar";

const BookingModal = ({
  show,
  handleClose,
  room,
  guests,
  handleBooking,
  fetchRooms,
}) => {
  const { t, i18n } = useTranslation("reception");
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Find guest details from existing props
  useEffect(() => {
   
    
    if (selectedGuestId) {
      const selectedGuest = guests.find(guest => guest.id == selectedGuestId);
      if (selectedGuest) {
        setGuestEmail(selectedGuest.email || "");
        setGuestPhone(selectedGuest.phone_number || "");
      }
    } else {
      setGuestEmail("");
      setGuestPhone("");
    }
  }, [selectedGuestId, guests]);

  // Calculate dates and price
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      if (checkInDate >= checkOutDate) {
        setError(t("CheckOutAfterCheckIn"));
        setTotalAmount(0);
        return;
      }

      const diffDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24));
      setTotalAmount(room?.price_per_night * diffDays);
      setError("");
    }
  }, [checkInDate, checkOutDate, room, t]);

// Frontend: JavaScript
const handleBookingClick = async () => {
  setIsLoading(true);
  setError("");

  // Validation
  if (!checkInDate || !checkOutDate || !selectedGuestId) {
    setError(t("FillAllFields"));
    setIsLoading(false);
    return;
  }

  try {
    // Convert dates to UTC
    const checkInUTC = new Date(Date.UTC(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate()
    ));
    
    const checkOutUTC = new Date(Date.UTC(
      checkOutDate.getFullYear(),
      checkOutDate.getMonth(),
      checkOutDate.getDate()
    ));

    const bookingDetails = {
      guest_id: selectedGuestId,
      room_id: room?.id,
      check_in_date: checkInUTC.toISOString().split("T")[0],
      check_out_date: checkOutUTC.toISOString().split("T")[0],
      email: guestEmail,
      phone_number: guestPhone,
      payment_status: paymentStatus,
      total_amount: totalAmount,
    };

    // Create booking
    const bookingResponse = await fetch("http://localhost:8000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(bookingDetails),
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error("Booking creation failed:", errorText);
      throw new Error("Failed to create booking");
    }

    const bookingData = await bookingResponse.json();

    console.log("Booking created:", bookingData);
    // Create payment if paid
    if (paymentStatus === 'paid') {
      const paymentResponse = await fetch(`http://localhost:8000/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          booking_id: bookingData.booking.id,
          payment_method: paymentMethod.toLowerCase(),
          amount_paid: totalAmount,
          payment_date: new Date().toISOString().split('T')[0]
        })
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error("Payment processing failed:", errorText);
        throw new Error("Payment processing failed");
      }
    }

    handleBooking(bookingData);
    fetchRooms();
    handleClose();
    resetForm();
  } catch (error) {
    console.error("Error during booking/payment:", error);
    setError(t("BookingFailed"));
  } finally {
    setIsLoading(false);
  }
};





  const resetForm = () => {
    setSelectedGuestId("");
    setGuestEmail("");
    setGuestPhone("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setTotalAmount(0);
    setPaymentStatus("Pending");
    setPaymentMethod("Cash");
  };

  return (
    <Modal 
      show={show} 
      onHide={() => {
        handleClose();
        resetForm();
      }}
    >
      <Modal.Header style={{ justifyContent: "space-between" }}>
        <Modal.Title>
          {t("BookRoom")}: {room?.room_number || t("Room")}
          {room?.type && `(${t(room.type)})`}
        </Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={() => {
            handleClose();
            resetForm();
          }}
          aria-label="Close"
          style={i18n.language === "ar" ? { margin: 0 } : {}}
        />
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Guest Selection */}
          <Form.Group className="mb-3">
            <Form.Label>{t("guestname")}</Form.Label>
            <Form.Control
              as="select"
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">{t("SelectGuest")}</option>
              {guests?.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {`${guest.first_name} ${guest.last_name}`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* Guest Details */}
          {selectedGuestId && (
            <div className="mb-3">
              <p>
                <strong>{t("email")}:</strong> {guestEmail}
              </p>
              <p>
                <strong>{t("phone")}:</strong> {guestPhone}
              </p>
            </div>
          )}

          {/* Date Pickers */}
          <Form.Group className="mb-3">
            <Form.Label>{t("chick-in-date")}</Form.Label>
            <BookingCalendar
              roomId={room?.id}
              selectedDate={checkInDate}
              setSelectedDate={setCheckInDate}
              minDate={new Date()}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("chick-out-date")}</Form.Label>
            <BookingCalendar
              roomId={room?.id}
              selectedDate={checkOutDate}
              setSelectedDate={setCheckOutDate}
              minDate={checkInDate || new Date()}
              disabled={isLoading}
            />
          </Form.Group>

          {/* Payment Section */}
          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentStatus")}</Form.Label>
            <Form.Control
              as="select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              disabled={isLoading}
            >
              <option value="Pending">{t("pending")}</option>
              <option value="paid">{t("paid")}</option>
            </Form.Control>
          </Form.Group>

          {paymentStatus === 'paid' && (
            <Form.Group className="mb-3">
              <Form.Label>{t("PaymentMethod")}</Form.Label>
              <Form.Control
                as="select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isLoading}
              >
                <option value="Cash">{t("Cash")}</option>
                <option value="Credit_Card">{t("CreditCard")}</option>
              </Form.Control>
            </Form.Group>
          )}

          {/* Total Amount */}
          <div className="mb-3">
            <h5>{t("TotalAmount")}: {totalAmount.toFixed(2)} JOD</h5>
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Submit Button */}
          <Button
            variant="primary"
            onClick={handleBookingClick}
            disabled={isLoading}
            className="w-100"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" /> {t("Loading")}
              </>
            ) : (
              t("BookNow")
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};


export default BookingModal;