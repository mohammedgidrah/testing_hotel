import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
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
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      if (checkInDate >= checkOutDate) {
        setError(t("Check Out After Check In"));
        setTotalAmount(0);
        return;
      }

      const diffDays = (checkOutDate - checkInDate) / (1000 * 3600 * 24);
      setTotalAmount(room?.price_per_night * diffDays);
      setError("");
    }
  }, [checkInDate, checkOutDate, room, t]);

  useEffect(() => {
    if (selectedGuestId) {
      fetch(`http://localhost:8000/api/guests/${selectedGuestId}`)
        .then((response) => response.json())
        .then((data) => {
          setGuestEmail(data.email || "");
          setGuestPhone(data.phone_number || "");
        })
        .catch(() => setError("Failed to fetch guest details"));
    } else {
      setGuestEmail("");
      setGuestPhone("");
    }
  }, [selectedGuestId]);

  const handleBookingClick = () => {
    setIsLoading(true);
    setError("");

    if (!checkInDate || !checkOutDate || !selectedGuestId) {
      setError(t("Fill All Fields"));
      setIsLoading(false);
      return;
    }

    const bookingDetails = {
      guest_id: selectedGuestId,
      room_id: room?.id,
      check_in_date: checkInDate.toISOString().split("T")[0],
      check_out_date: checkOutDate.toISOString().split("T")[0],
      email: guestEmail,
      phone_number: guestPhone,
      payment_status: paymentStatus,
      total_amount: totalAmount,
    };

    fetch("http://localhost:8000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(bookingDetails),
    })
      .then((response) => response.json())
      .then(() => {
        handleBooking(bookingDetails);
        fetchRooms();
        handleClose();
        resetForm();
      })
      .catch(() => setError("Booking failed"))
      .finally(() => setIsLoading(false));
  };

  const resetForm = () => {
    setSelectedGuestId("");
    setGuestEmail("");
    setGuestPhone("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setTotalAmount(0);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header
        style={{
          justifyContent: "space-between",
        }}
      >
        <Modal.Title>
          {t("BookRoom")}: {room?.room_number || "Room"}
          {room?.type && `(${t(room.type)})`}
        </Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          aria-label="Close"
          style={i18n.language === "ar" ? { margin: 0 } : {}}
        />
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Select Guest */}
          <Form.Group>
            <Form.Label>{t("guestname")}</Form.Label>
            <Form.Control
              as="select"
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
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
            <div>
              <p>
                <strong>{t("email")}:</strong> {guestEmail}
              </p>
              <p>
                <strong>{t("phone")}:</strong> {guestPhone}
              </p>
            </div>
          )}

          {/* Booking Dates */}
          <Form.Group className="mb-1 flex flex-col  pt-1">
            <Form.Label>{t("chick-in-date")}</Form.Label>
            <BookingCalendar
              roomId={room?.id}
              onDateChange={setCheckInDate}
              selectedDate={checkInDate}
              setSelectedDate={setCheckInDate}
            />
          </Form.Group>

          <Form.Group className="mb-2 flex flex-col  pt-1">
            <Form.Label>{t("chick-out-date")}</Form.Label>
            <BookingCalendar
              roomId={room?.id}
              selectedDate={checkOutDate}
              setSelectedDate={setCheckOutDate}
            />
          </Form.Group>

          {/* Payment Status */}
          <Form.Group>
            <Form.Label>{t("PaymentStatus")}</Form.Label>
            <Form.Control
              as="select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="Pending">{t("pending")}</option>
              <option value="paid">{t("paid")}</option>
            </Form.Control>
          </Form.Group>

          {/* Total Amount */}
          <div className="flex flex-col  pt-2">
            <p className="pb-2">
              <strong>{t("TotalAmount")}:</strong> {totalAmount} JOD
            </p>

            {/* Error Message */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Booking Button */}
            <Button
              variant="primary"
              onClick={handleBookingClick}
              disabled={isLoading}
            >
              {isLoading ? t("Loading") : t("Book Now")}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingModal;
