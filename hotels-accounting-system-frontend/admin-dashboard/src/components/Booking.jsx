import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BookingCalendar from "./BookingCalendar";
import axios from "axios";

const AddGuestModal = ({
  show,
  onClose,
  onAddGuest,
  initialName,
  
}) => {
  const { t, i18n } = useTranslation("reception");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setError("");
  };

  useEffect(() => {
    if (initialName) {
      const parts = initialName.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [initialName]);

  const handleAddGuest = async () => {
    setError("");
    
    if (!firstName.trim()) {
      setError(t("FirstNameRequired"));
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/guests",
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
          address: address,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onAddGuest(response.data);
      onClose();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("AddGuestFailed");
      setError(errorMessage);
      console.error("Error adding guest:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
     

     <Modal.Header
  closeButton
  style={i18n.language === "ar" ? { direction: "ltr" } : {}}
>
  <Modal.Title>{t("AddGuest")}</Modal.Title>
</Modal.Header>

    

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t("FirstName")}*</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
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


          {/* Other form fields remain the same */}

          {error && <div className="alert alert-danger mt-3">{error}</div>}
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
  fetchGuests,
}) => {
  const { t, i18n } = useTranslation("reception");
  const [selectedGuestName, setSelectedGuestName] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesAmount, setServicesAmount] = useState(0);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);

  const TAX_RATE = 0.1;

  useEffect(() => {
    if (show) {
      fetchServices();
      fetchGuests?.();
    }
  }, [show]);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/services", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    if (selectedGuestId) {
      const selectedGuest = guests.find((guest) => guest.id === selectedGuestId);
      setGuestEmail(selectedGuest?.email || "");
      setGuestPhone(selectedGuest?.phone_number || "");
    }
  }, [selectedGuestId, guests]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      if (checkInDate >= checkOutDate) {
        setError(t("CheckOutAfterCheckIn"));
        return;
      }

      const diffDays = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 3600 * 24)
      );
      const baseAmount = (room?.price_per_night || 0) * diffDays;
      const servicesAmount = selectedServices.reduce(
        (acc, service) => acc + (Number(service.price) || 0),
        0
      );

      const calculatedTotal = baseAmount + servicesAmount;
      const calculatedTax = calculatedTotal * TAX_RATE;

      setTotalAmount(calculatedTotal);
      setTaxAmount(calculatedTax);
      setServicesAmount(servicesAmount);
      setError("");
    }
  }, [checkInDate, checkOutDate, room, selectedServices, t]);

  const handleServiceChange = (service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const formatDate = (date) => date?.toISOString().split("T")[0];

  const handleBookingClick = async () => {
    setIsLoading(true);
    setError("");
  
    if (!checkInDate || !checkOutDate || !selectedGuestId) {
      setError(t("FillAllFields"));
      setIsLoading(false);
      return;
    }
  
    try {
      const bookingDetails = {
        guest_id: selectedGuestId,
        room_id: room?.id,
        check_in_date: formatDate(checkInDate),
        check_out_date: formatDate(checkOutDate),
        email: guestEmail,
        phone_number: guestPhone,
        payment_status: paymentStatus,
        total_amount: totalAmount + taxAmount,
        services: selectedServices.map(service => service.id), // Send service IDs
      };
  
      const response = await axios.post(
        "http://localhost:8000/api/bookings",
        bookingDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (paymentStatus === "paid") {
        await axios.post(
          "http://localhost:8000/api/payments",
          {
            booking_id: response.data.booking.id,
            payment_method: paymentMethod.toLowerCase(),
            amount_paid: totalAmount + taxAmount,
            payment_date: formatDate(new Date()),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
  
      handleBooking(response.data);
      fetchRooms();
      handleClose();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("BookingFailed");
      setError(errorMessage);
      console.error("Booking error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedGuestId("");
    setSelectedGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setTotalAmount(0);
    setTaxAmount(0);
    setServicesAmount(0);
    setPaymentStatus("Pending");
    setPaymentMethod("Cash");
    setSelectedServices([]);
    setError("");
  };

  const handleGuestSelection = (name) => {
    setSelectedGuestName(name);
    const guest = guests.find(g => 
      `${g.first_name} ${g.last_name}`.toLowerCase() === name.toLowerCase()
    );
    setSelectedGuestId(guest?.id || null);
  };

  const handleGuestBlur = () => {
    if (selectedGuestName && !selectedGuestId) {
      setShowAddGuestModal(true);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header    closeButton
  style={i18n.language === "ar" ? { direction: "ltr" } : {}}  >
          <Modal.Title>
            {t("BookRoom")}: {room?.room_number} ({t(room?.type)})
          </Modal.Title>
          
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t("guestname")}*</Form.Label>
              <Form.Control
                type="text"
                list="guest-list"
                value={selectedGuestName}
                onChange={(e) => handleGuestSelection(e.target.value)}
                onBlur={handleGuestBlur}
                disabled={isLoading}
              />
              <datalist id="guest-list">
                {guests.map(guest => (
                  <option key={guest.id} value={`${guest.first_name} ${guest.last_name}`} />
                ))}
              </datalist>
            </Form.Group>

            {/* Date Pickers */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>{t("chick-in-date")}*</Form.Label>
                  <BookingCalendar
                    roomId={room?.id}
                    selectedDate={checkInDate}
                    setSelectedDate={setCheckInDate}
                    minDate={new Date()}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>{t("chick-out-date")}*</Form.Label>
                  <BookingCalendar
                    roomId={room?.id}
                    selectedDate={checkOutDate}
                    setSelectedDate={setCheckOutDate}
                    minDate={checkInDate || new Date()}
                  />
                </Form.Group>
              </div>
            </div>

            {/* Services Selection */}
            <Form.Group className="mb-4">
              <Form.Label>{t("AdditionalServices")}</Form.Label>
              <div className="row g-2">
                {services.map(service => (
                  <div className="col-md-2 border p-2" key={service.id}>
                    <Form.Check
                      type="checkbox"
                      label={`${service.name} (${service.price} JOD)`}
                      checked={selectedServices.some(s => s.id === service.id)}
                      onChange={() => handleServiceChange(service)}
                    />
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Payment Section */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>{t("PaymentStatus")}*</Form.Label>
                  <Form.Select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Pending">{t("pending")}</option>
                    <option value="paid">{t("paid")}</option>
                  </Form.Select>
                </Form.Group>
              </div>
              {paymentStatus === "paid" && (
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>{t("PaymentMethod")}*</Form.Label>
                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">{t("Cash")}</option>
                      <option value="Credit_Card">{t("CreditCard")}</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="alert alert-primary">
              <div className="d-flex justify-content-between">
                <span>{t("Subtotal")}:</span>
                <span>{totalAmount.toFixed(2)} JOD</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>{t("Services")}:</span>
                <span>{servicesAmount.toFixed(2)} JOD</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>{t("Tax")} ({TAX_RATE * 100}%):</span>
                <span>{taxAmount.toFixed(2)} JOD</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>{t("TotalAmount")}:</span>
                <span>{(totalAmount + taxAmount).toFixed(2)} JOD</span>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <Button
              variant="primary"
              size="lg"
              className="w-100"
              onClick={handleBookingClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                t("BookNow")
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <AddGuestModal
        show={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        onAddGuest={(newGuest) => {
          setSelectedGuestId(newGuest.id);
          setSelectedGuestName(`${newGuest.first_name} ${newGuest.last_name}`);
          fetchGuests?.();
        }}
        initialName={selectedGuestName}
      />
    </>
  );
};

export default BookingModal;