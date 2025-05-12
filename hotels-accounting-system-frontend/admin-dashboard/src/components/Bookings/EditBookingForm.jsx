import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useTranslation } from "react-i18next";
import BookingCalendar from "../BookingCalendar";

function EditBookingForm({ booking, show, onHide, onUpdate, rooms }) {
  const { t, i18n } = useTranslation("bookings");
  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
    payment_status: "",
    payment_method: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [payments, setPayments] = useState([]);

  // Fetch payments on component mount
  const fetchPayments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/payments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments(response.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Initialize form data when booking prop changes
  useEffect(() => {
    if (booking) {
      const payment = payments.find((p) => p.booking_id === booking.id);
      setFormData({
        guest_id: booking.guest_id || "",
        room_id: booking.room?.id || booking.room_id || "", // Handle different room property formats
        check_in_date: booking.check_in_date
          ? booking.check_in_date.split("T")[0]
          : "",
        check_out_date: booking.check_out_date
          ? booking.check_out_date.split("T")[0]
          : "",
        payment_status: booking.payment_status || "",
        payment_method: payment?.payment_method || "", // Set payment method from payments data
      });

      setTotalAmount(parseFloat(booking.total_amount) || 0);
      setTaxAmount(parseFloat(booking.tax_amount) || 0);
    }
  }, [booking, payments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.room_id) newErrors.room_id = t("RoomRequired");
    if (!formData.check_in_date) newErrors.check_in_date = t("CheckInRequired");
    if (!formData.check_out_date)
      newErrors.check_out_date = t("CheckOutRequired");
    if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
      newErrors.check_out_date = t("CheckOutAfterCheckIn");
    }
    if (!formData.payment_status)
      newErrors.payment_status = t("StatusRequired");
    if (formData.payment_status === "paid" && !formData.payment_method) {
      newErrors.payment_method = t("PaymentMethodRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      console.error("Validation failed");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Update booking details
      const bookingResponse = await axios.put(
        `http://127.0.0.1:8000/api/bookings/${booking.id}`,
        formData,
        { headers }
      );

      // 2. Handle payment updates
      let paymentData = null;
      const { payment_status, payment_method } = formData;
      const amount = Number(
        (parseFloat(totalAmount) + parseFloat(taxAmount)).toFixed(2)
      );

      if (payment_status === "paid") {
        const paymentPayload = {
          payment_method: payment_method.toLowerCase(),
          amount_paid: amount,
          payment_date: new Date().toISOString().split("T")[0],
        };

        // Find payment for this booking
        const existingPayment = payments.find(
          (p) => p.booking_id === booking.id
        );

        if (existingPayment) {
          // Update existing payment
          const paymentResponse = await axios.put(
            `http://localhost:8000/api/payments/${existingPayment.id}`,
            paymentPayload,
            { headers }
          );
          paymentData = paymentResponse.data;
        } else {
          // Create new payment
          const paymentResponse = await axios.post(
            "http://localhost:8000/api/payments",
            { booking_id: booking.id, ...paymentPayload },
            { headers }
          );
          paymentData = paymentResponse.data;
        }
      } else if (payment_status === "pending") {
        // Find payment for this booking
        const existingPayment = payments.find(
          (p) => p.booking_id === booking.id
        );

        // Delete payment if status changed from paid to pending
        if (existingPayment) {
          await axios.delete(
            `http://localhost:8000/api/payments/${existingPayment.id}`,
            { headers }
          );
        }
      }

      // 3. Combine data for parent update
      onUpdate({
        ...bookingResponse.data,
        payment_status,
        payment: paymentData || null,
      });

      onHide();
    } catch (error) {
      console.error("Update error:", error.response?.data || error);
      setErrors({ submit: error.response?.data?.message || t("UpdateError") });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Always show payment method field when payment status is "paid"
  const showPaymentMethodField = formData.payment_status === "paid";

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header
        closeButton
        style={i18n.language === "ar" ? { direction: "ltr" } : {}}
        className="bg-gray-800 text-xl font-bold text-white border-none custom-close"
      >
        <Modal.Title>{t("EditBooking")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="bg-gray-800 text-x text-gray-200 text-opacity-80">
          {errors.submit && (
            <div className="alert alert-danger">{errors.submit}</div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>{t("room")}</Form.Label>
            <div className="relative w-full">
              <Form.Select
                name="room_id"
                value={formData.room_id}
                onChange={handleChange}
                isInvalid={!!errors.room_id}
                className=" bg-gray-700 text-white rounded    border-none focus:ring-0 focus:bg-gray-700  "
              >
                <option value="">{t("SelectRoom")}</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_number} - {room.type} (${room.price_per_night})
                  </option>
                ))}
              </Form.Select>
              <div
                className="pointer-events-none absolute  text-   "
                style={{ top: "1.1rem", right: "1rem" }}
              >
                <div className="w-1 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
              </div>

              <Form.Control.Feedback type="invalid">
                {errors.room_id}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <div className="d-flex flex-row gap-4">
              <div className="d-flex flex-column col-md-6">
                <Form.Label className="fw-bold">{t("CheckInDate")}</Form.Label>
                <BookingCalendar
                  roomId={formData.room_id}
                  selectedDate={
                    formData.check_in_date
                      ? new Date(formData.check_in_date)
                      : null
                  }
                  setSelectedDate={(date) =>
                    setFormData({
                      ...formData,
                      check_in_date: formatDate(date),
                    })
                  }
                  minDate={new Date()}
                />
                {errors.check_in_date && (
                  <div className="text-danger mt-1">{errors.check_in_date}</div>
                )}
              </div>

              <div className="d-flex flex-column col-md-6">
                <Form.Label className="fw-bold">{t("CheckOutDate")}</Form.Label>
                <BookingCalendar
                  roomId={formData.room_id}
                  selectedDate={
                    formData.check_out_date
                      ? new Date(formData.check_out_date)
                      : null
                  }
                  setSelectedDate={(date) =>
                    setFormData({
                      ...formData,
                      check_out_date: formatDate(date),
                    })
                  }
                  minDate={
                    formData.check_in_date
                      ? new Date(formData.check_in_date)
                      : new Date()
                  }
                />
                {errors.check_out_date && (
                  <div className="text-danger mt-1">
                    {errors.check_out_date}
                  </div>
                )}
              </div>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentStatus")}</Form.Label>
            <div className="relative w-full">
              <Form.Select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                isInvalid={!!errors.payment_status}
                className="w-full bg-gray-700 text-white rounded   border-none focus:ring-0 focus:bg-gray-700  "
              >
                <option value="">{t("SelectStatus")}</option>
                <option value="paid">{t("paid")}</option>
                <option value="pending">{t("pending")}</option>
              </Form.Select>
              <div
                className="pointer-events-none absolute    "
                style={{ top: "1.1rem", right: "1rem" }}
              >
                <div className="w-1 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.payment_status}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          {showPaymentMethodField && (
            <Form.Group className="mb-3">
              <Form.Label>{t("PaymentMethod")}</Form.Label>
              <div className="relative w-full">
                <Form.Select
                  name="payment_method"
                  value={formData.payment_method || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.payment_method}
                  className="w-full bg-gray-700 text-white rounded   border-none focus:ring-0 focus:bg-gray-700  "
                >
                  <option value="">{t("slectpaymentmethod")}</option>
                  <option value="cash">{t("Cash")}</option>
                  <option value="credit_card">{t("CreditCard")}</option>
                </Form.Select>
                <div
                  className="pointer-events-none absolute      "
                  style={{ top: "1.1rem", right: "1rem" }}
                >
                  <div className="w-1 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.payment_method}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="  bg-gray-800 text-white  p-2 pr-10  border-none  ">
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("Saving...") : t("savchanges")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditBookingForm;
