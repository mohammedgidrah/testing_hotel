import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BookingCalendar from "./BookingCalendar";

// New Component: Modal to add a new guest if they do not exist
const AddGuestModal = ({ show, onClose, onAddGuest, initialName ,handleClose }) => {
  const { t, i18n } = useTranslation("reception");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  
  handleClose = () => {
    onClose();
    resetForm();
  };
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
  }

  // If a name was already entered, split it to prefill the fields.
  useEffect(() => {
    if (initialName) {
      const parts = initialName.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [initialName]);

  const handleAddGuest = async () => {
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
          address: address,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }
      const newGuest = await response.json();
      // Pass the new guest back to the parent
      onAddGuest(newGuest);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding guest:", error);
      setError(t("AddGuestFailed") || "Failed to add guest");
    }
  };

  return (
    <Modal show={show} onHide={() => { handleClose(); resetForm(); }}>
      <Modal.Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Modal.Title>{t("AddGuest")}</Modal.Title>
        <Button
          variant="close"
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
          <Form.Group className="mb-3">
            <Form.Label>{t("FirstName")}</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("LastName")}</Form.Label>
            <Form.Control
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("email")}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("phone")}</Form.Label>
            <Form.Control
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("address")}</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>
          {error && <div className="alert alert-danger">{error}</div>}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleAddGuest}>
          {t("AddGuest")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


const BookingModal = ({
  show,
  handleClose,
  room,
  guests,
  handleBooking,
  fetchRooms,
}) => {
  const { t, i18n } = useTranslation("reception");
  const [selectedGuestName, setSelectedGuestName] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);  // New state for tax
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);

  const TAX_RATE = 0.07;  // 10%

  // Update guest details when a valid guest is selected.
  useEffect(() => {
    if (selectedGuestId) {
      const selectedGuest = guests.find(
        (guest) => guest.id == selectedGuestId
      );
      if (selectedGuest) {
        setGuestEmail(selectedGuest.email || "");
        setGuestPhone(selectedGuest.phone_number || "");
      }
    } else {
      setGuestEmail("");
      setGuestPhone("");
    }
  }, [selectedGuestId, guests]);

  // Calculate the total amount based on check-in/out dates.
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      if (checkInDate >= checkOutDate) {
        setError(t("CheckOutAfterCheckIn"));
        setTotalAmount(0);
        setTaxAmount(0);
        return;
      }
      const diffDays = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 3600 * 24)
      );
 
      // Calculate tax amount (10% of total amount)
      const calculatedTotalAmount = room?.price_per_night * diffDays;
      setTotalAmount(calculatedTotalAmount);
      
      // Calculate tax based on the total amount
      const calculatedTax = calculatedTotalAmount * TAX_RATE;
      setTaxAmount(calculatedTax);

      setError("");
    }
  }, [checkInDate, checkOutDate, room, t]);

  const handleBookingClick = async () => {
    setIsLoading(true);
    setError("");

    // Ensure that required fields are set.
    if (!checkInDate || !checkOutDate || !selectedGuestId) {
      setError(t("FillAllFields"));
      setIsLoading(false);
      return;
    }

    try {
      // Convert dates to UTC format
      const checkInUTC = new Date(
        Date.UTC(
          checkInDate.getFullYear(),
          checkInDate.getMonth(),
          checkInDate.getDate()
        )
      );
      const checkOutUTC = new Date(
        Date.UTC(
          checkOutDate.getFullYear(),
          checkOutDate.getMonth(),
          checkOutDate.getDate()
        )
      );
const finalAmount = totalAmount + taxAmount;
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

      // Create the booking
      const bookingResponse = await fetch(
        "http://localhost:8000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(bookingDetails),
        }
      );

      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text();
        console.error("Booking creation failed:", errorText);
        throw new Error("Failed to create booking");
      }

      const bookingData = await bookingResponse.json();
      console.log("Booking created:", bookingData);

      // If payment is required, process it
      if (paymentStatus === "paid") {
        const paymentResponse = await fetch(
          "http://localhost:8000/api/payments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              booking_id: bookingData.booking.id,
              payment_method: paymentMethod.toLowerCase(),
              amount_paid: totalAmount,
              payment_date: new Date().toISOString().split("T")[0],
            }),
          }
        );

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
    setSelectedGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setTaxAmount(0);
    setCheckInDate(null);
    setCheckOutDate(null);
    setTotalAmount(0);
    setPaymentStatus("Pending");
    setPaymentMethod("Cash");
  };

  // Called as the user types in the guest name field.
  const handleGuestSelection = (name) => {
    setSelectedGuestName(name);
    const selectedGuest = guests.find(
      (guest) =>
        `${guest.first_name} ${guest.last_name}`.toLowerCase() ===
        name.toLowerCase()
    );
    if (selectedGuest) {
      setSelectedGuestId(selectedGuest.id);
    } else {
      setSelectedGuestId(null);
    }
  };

  // On blur, if the name entered does not match any guest, show the AddGuestModal.
  const handleGuestBlur = () => {
    if (
      selectedGuestName &&
      !guests.find(
        (guest) =>
          `${guest.first_name} ${guest.last_name}`.toLowerCase() ===
          selectedGuestName.toLowerCase()
      )
    ) {
      setShowAddGuestModal(true);
    }
  };
  

  // When a new guest is successfully added, update the selection.
  const handleNewGuestAdded = (newGuest) => {
    setSelectedGuestId(newGuest.id);
    setSelectedGuestName(`${newGuest.first_name} ${newGuest.last_name}`);
    // Optionally, you could also update the guest list if desired.
  };

  return (
    <>
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
            {/* Guest Selection with datalist */}
            <Form.Group className="mb-3">
              <Form.Label>{t("guestname")}</Form.Label>
              <Form.Control
                type="text"
                list="guest"
                value={selectedGuestName}
                onChange={(e) => handleGuestSelection(e.target.value)}
                onBlur={handleGuestBlur}
                disabled={isLoading}
              />
              <datalist id="guest">
                {guests?.map((guest) => (
                  <option
                    key={guest.id}
                    value={`${guest.first_name} ${guest.last_name}`}
                  >
                    {`${guest.first_name} ${guest.last_name}`}
                  </option>
                ))}
              </datalist>
            </Form.Group>

            {/* Display Guest Details if a valid guest is selected */}
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
            {paymentStatus === "paid" && (
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
            <div>
              <strong>{t("AmountwithoutTax")}</strong>: {totalAmount.toFixed(2)}{" "}JOD
               
            </div>
            <div>
              <strong>{t("Tax")}</strong>: {taxAmount.toFixed(2)}  JOD
            </div>
            <div>
              <strong>{t("TotalAmount")}</strong>:{" "}
              {(totalAmount + taxAmount).toFixed(2)} JOD
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
      {/* Render the AddGuestModal */}
      <AddGuestModal
    show={showAddGuestModal}
    onClose={() => setShowAddGuestModal(false)}
    onAddGuest={(newGuest) => {
      setSelectedGuestId(newGuest.id);
      setSelectedGuestName(`${newGuest.first_name} ${newGuest.last_name}`);
      setGuestEmail(newGuest.email);
      setGuestPhone(newGuest.phone_number);
    }}
    initialName={selectedGuestName}
  />


    </>
  );
};

export default BookingModal;
