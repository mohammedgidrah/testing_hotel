import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BookingCalendar from "./BookingCalendar";
import axios from "axios";
import "../components/bookingcalender.css";

const AddGuestModal = ({ show, onClose, onAddGuest, initialName }) => {
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
        className="bg-gray-800 text-xl font-bold text-white border-none custom-close"
      >
        <Modal.Title>{t("AddGuest")}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-gray-800 text-x text-gray-200 text-opacity-80">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t("FirstName")}*</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded p-2 border-none focus:ring-0 focus:bg-gray-700   "
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("LastName")}</Form.Label>
            <Form.Control
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border-none focus:ring-0 focus:bg-gray-700   "
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("email")}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border-none focus:ring-0 focus:bg-gray-700   "
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("phone")}</Form.Label>
            <Form.Control
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border-none focus:ring-0 focus:bg-gray-700   "
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("address")}</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border-none focus:ring-0 focus:bg-gray-700   "
            />
          </Form.Group>

          {/* Other form fields remain the same */}

          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
      </Modal.Body>

      <Modal.Footer className="  bg-gray-800 text-white  p-2 pr-10  border-none  ">
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

  const [currentPage, setCurrentPage] = useState(1);

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

  const itemsPerPage = 6; // You can adjust this number

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

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
      const selectedGuest = guests.find(
        (guest) => guest.id === selectedGuestId
      );
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
        services: selectedServices.map((service) => service.id), // Send service IDs
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
    const guest = guests.find(
      (g) =>
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
        <Modal.Header
          closeButton
          style={i18n.language === "ar" ? { direction: "ltr" } : {}}
          className="bg-gray-800 text-xl font-bold text-white border-none custom-close"
        >
          <Modal.Title>
            {t("BookRoom")}: {room?.room_number} ({t(room?.type)})
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-gray-800 text-x text-gray-200 text-opacity-80">
          <Form>
            <Form.Group
              className="mb-3"
              style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
            >
              <Form.Label>{t("guestname")}*</Form.Label>
              <Form.Control
                type="text"
                list="guest-list"
                value={selectedGuestName}
                onChange={(e) => handleGuestSelection(e.target.value)}
                onBlur={handleGuestBlur}
                disabled={isLoading}
                className="w-full bg-gray-700 text-white rounded p-2  border-none focus:ring-0 focus:bg-gray-700 "
              />
              <datalist id="guest-list">
                {guests.map((guest) => (
                  <option
                    key={guest.id}
                    value={`${guest.first_name} ${guest.last_name}`}
                  />
                ))}
              </datalist>
              {selectedGuestId && (
                <div
                  className="mb-3"
                  style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
                >
                  <p>
                    <strong>{t("email")}:</strong> {guestEmail}
                  </p>
                  <p>
                    <strong>{t("phone")}:</strong> {guestPhone}
                  </p>
                </div>
              )}
            </Form.Group>

            {/* Date Pickers */}
            <div
              className="row g-3 mb-4"
              style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
            >
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
            <Form.Group
              className="mb-4"
              style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
            >
              <Form.Label>{t("AdditionalServices")}</Form.Label>
              <div className="row g-2">
                {currentServices.map((service) => (
                  <div className="col-md-2 border p-2" key={service.id}>
                    <Form.Check
                      type="checkbox"
                      label={`${service.name} (${service.price} JOD)`}
                      checked={selectedServices.some(
                        (s) => s.id === service.id
                      )}
                      onChange={() => handleServiceChange(service)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-3 d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                >
                  {t("Previous")}
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                >
                  {t("Next")}
                </button>
              </div>
            </Form.Group>

            {/* Payment Section */}
            <div
              className="row g-3 mb-4"
              style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
            >
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>{t("PaymentStatus")}*</Form.Label>
                  <div className="relative w-full">
                    <Form.Select
                      id="select"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full appearance-none bg-gray-700 text-white rounded p-2 pr-10 border-none focus:ring-0 focus:bg-gray-700"
                    >
                      <option value="Pending">{t("pending")}</option>
                      <option value="paid">{t("paid")}</option>
                    </Form.Select>

                    {/* Pure CSS triangle arrow */}
                    <div
                      className="pointer-events-none absolute      "
                      style={{ top: "1.1rem", right: "1rem" }}
                    >
                      <div className="w-1 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  </div>
                </Form.Group>
              </div>
              {paymentStatus === "paid" && (
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>{t("PaymentMethod")}*</Form.Label>
                    <div className="relative w-full">
                      <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded p-2 pr-10 border-none focus:ring-0 focus:bg-gray-700  "
                      >
                        <option value="Cash">{t("Cash")}</option>
                        <option value="Credit_Card">{t("CreditCard")}</option>
                      </Form.Select>
                      <div
                        className="pointer-events-none absolute  text-   "
                      style={{ top: "1.1rem", right: "1rem" }}
                      >
                        <div className="w-1 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                      </div>
                    </div>
                  </Form.Group>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div
              className="alert alert-primary text-white border-none "
              style={{
                backgroundColor: "rgba(0, 123, 255, 0.25)",
                direction: i18n.language === "ar" ? "ltr" : "ltr",
              }}
            >
              <div className="d-flex justify-content-between ">
                <span>{t("Subtotal")}:</span>
                <span>{totalAmount.toFixed(2)} JOD</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>{t("Services")}:</span>
                <span>{servicesAmount.toFixed(2)} JOD</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>
                  {t("Tax")} ({TAX_RATE * 100}%):
                </span>
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
