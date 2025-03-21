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
        room_id: booking.room_id?.id || booking.room_id || "", // Handle case where room_id is an object
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

        if (booking.payment?.id) {
          // Update existing payment
          const paymentResponse = await axios.put(
            `http://localhost:8000/api/payments/${booking.payment.id}`,
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
      } else if (booking.payment?.id) {
        // Delete payment if status changed from paid to pending
        await axios.delete(
          `http://localhost:8000/api/payments/${booking.payment.id}`,
          { headers }
        );
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

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header
        closeButton
        style={i18n.language === "ar" ? { direction: "ltr" } : {}}
      >
        <Modal.Title>{t("EditBooking")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.submit && (
            <div className="alert alert-danger">{errors.submit}</div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>{t("room")}</Form.Label>
            <Form.Select
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              isInvalid={!!errors.room_id}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} - {room.type} (${room.price_per_night})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.room_id}
            </Form.Control.Feedback>
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
                <Form.Control.Feedback type="invalid" className="mt-1">
                  {errors.check_in_date}
                </Form.Control.Feedback>
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
                <Form.Control.Feedback type="invalid" className="mt-1">
                  {errors.check_out_date}
                </Form.Control.Feedback>
              </div>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentStatus")}</Form.Label>
            <Form.Select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              isInvalid={!!errors.payment_status}
            >
              <option value="paid">{t("paid")}</option>
              <option value="pending">{t("pending")}</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.payment_status}
            </Form.Control.Feedback>
          </Form.Group>

          {formData.payment_status === "paid" &&  formData.payment_method !== "cash" && formData.payment_method !== "credit_card" && (
            <Form.Group className="mb-3">
              <Form.Label>{t("PaymentMethod")}</Form.Label>
              <Form.Select
                name="payment_method"
                value={formData.payment_method || ""}
                onChange={handleChange}
                isInvalid={!!errors.payment_method}
              >
                <option value="">{t("slectpaymentmethod")}</option>
                <option value="cash">{t("Cash")}</option>
                <option value="credit_card">{t("CreditCard")}</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.payment_method}
              </Form.Control.Feedback>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
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
