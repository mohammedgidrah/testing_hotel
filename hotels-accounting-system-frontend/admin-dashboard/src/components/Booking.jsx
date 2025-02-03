import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const BookingModal = ({ show, handleClose, room, guests, handleBooking }) => {
  const { t, i18n } = useTranslation("reception");
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
          if (!response.ok) throw new Error("Failed to fetch guest details");
          return response.json();
        })
        .then((data) => {
          setGuestEmail(data.email || "");
          setGuestPhone(data.phone_number || "");
        })
        .catch((error) => setError(error.message));
    } else {
      setGuestEmail("");
      setGuestPhone("");
    }
  }, [selectedGuestId]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      if (checkIn >= checkOut) {
        setError(t("Check Out After Check In"));
        setIsRoomAvailable(false);
        setTotalAmount(0);
        return;
      }

      setIsRoomAvailable(true);
      const diffDays = (checkOut - checkIn) / (1000 * 3600 * 24);
      setTotalAmount(room?.price_per_night ? room.price_per_night * diffDays : 0);
      setError("");
    }
  }, [checkInDate, checkOutDate, room, t]);

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
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
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
      .then((response) => {
        if (!response.ok) throw new Error("Failed to book room");
        return response.json();
      })
      .then(() => {
        handleBooking(bookingDetails);
        handleClose();
      })
      .catch((error) => setError(error.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal show={show} onHide={handleClose}  >
<Modal.Header
   style={{
    justifyContent: "space-between",
  }}
>
  <Modal.Title>{t("BookRoom")}: {room?.room_number || "Room"}</Modal.Title>
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
          <Form.Group>
            <Form.Label>{t("guestname")}</Form.Label>
            <Form.Control as="select" value={selectedGuestId} onChange={(e) => setSelectedGuestId(e.target.value)}>
              <option value="">{t("SelectGuest")}</option>
              {guests?.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {`${guest.first_name} ${guest.last_name}`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {selectedGuestId && (
            <div>
              <p><strong>{t("email")}:</strong> {guestEmail}</p>
              <p><strong>{t("phone")}:</strong> {guestPhone}</p>
            </div>
          )}

          <Form.Group>
            <Form.Label>{t("check-in-date")}</Form.Label>
            <Form.Control type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("check-out-date")}</Form.Label>
            <Form.Control type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("PaymentStatus")}</Form.Label>
            <Form.Control as="select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="Pending">{t("pending")}</option>
              <option value="Completed">{t("completed")}</option>
            </Form.Control>
          </Form.Group>
        </Form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        {totalAmount > 0 && <p><strong>{t("TotalAmount")}:</strong> ${totalAmount.toFixed(2)}</p>}
        <Button variant="secondary" onClick={handleClose}>{t("close")}</Button>
        <Button variant="primary" onClick={handleBookingClick} disabled={isLoading}>
          {isLoading ? t("Booking") : t("BookNow")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingModal;
