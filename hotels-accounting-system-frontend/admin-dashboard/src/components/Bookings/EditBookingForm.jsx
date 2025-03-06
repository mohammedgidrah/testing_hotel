import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useTranslation } from "react-i18next";
import BookingCalendar from "../BookingCalendar";

function EditBookingForm({ booking, show, onHide, onUpdate, rooms }) {
  const { t } = useTranslation("bookings");
  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
    payment_status: "",
    // total_amount: "",
    
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        guest_id: booking.guest_id || "",
        room_id: booking.room_id?.id || booking.room_id || "",
        check_in_date: booking.check_in_date.split("T")[0],
        check_out_date: booking.check_out_date.split("T")[0],
        payment_status: booking.payment_status,
        // total_amount: booking.total_amount,
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // if (!formData.guest_id) newErrors.guest_id = t("GuestRequired");
    if (!formData.room_id) newErrors.room_id = t("RoomRequired");
    if (!formData.check_in_date) newErrors.check_in_date = t("CheckInRequired");
    if (!formData.check_out_date) newErrors.check_out_date = t("CheckOutRequired");
    if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
      newErrors.check_out_date = t("CheckOutAfterCheckIn");
    }
    if (!formData.payment_status) newErrors.payment_status = t("StatusRequired");
    // if (!formData.total_amount || isNaN(formData.total_amount)) {
    //   newErrors.total_amount = t("TotalAmountInvalid");
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/bookings/${booking.id}`,
        formData
      );
      onUpdate(response.data);
      onHide();
    } catch (error) {
      setErrors({ submit: t("UpdateError") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t("EditBooking")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.submit && (
            <div className="alert alert-danger">{errors.submit}</div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>{t("Room")}</Form.Label>
            <Form.Select
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              isInvalid={!!errors.room_id}
            >
              <option value="">{t("SelectRoom")}</option>
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

          <Form.Group className="mb-3">
            <Form.Label>{t("CheckInDate")}</Form.Label>
            <BookingCalendar
              roomId={formData.room_id}
              selectedDate={
                formData.check_in_date ? new Date(formData.check_in_date) : null
              }
              setSelectedDate={(date) =>
                setFormData({
                  ...formData,
                  check_in_date: date.toISOString().split("T")[0],
                })
              }
              minDate={new Date()}
            />
            <Form.Control.Feedback type="invalid">
              {errors.check_in_date}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("CheckOutDate")}</Form.Label>
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
                  check_out_date: date.toISOString().split("T")[0],
                })
              }
              minDate={
                formData.check_in_date
                  ? new Date(formData.check_in_date)
                  : new Date()
              }
            />
            <Form.Control.Feedback type="invalid">
              {errors.check_out_date}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentStatus")}</Form.Label>
            <Form.Select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              isInvalid={!!errors.payment_status}
            >
              {/* <option value="">{t("SelectStatus")}</option> */}
              <option value="paid">{t("paid")}</option>
              <option value="pending">{t("pending")}</option>
             </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.payment_status}
            </Form.Control.Feedback>
          </Form.Group>

          {/* <Form.Group className="mb-3">
            <Form.Label>{t("TotalAmount")}</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              isInvalid={!!errors.total_amount}
            />
            <Form.Control.Feedback type="invalid">
              {errors.total_amount}
            </Form.Control.Feedback>
          </Form.Group> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("Saving...") : t("SaveChanges")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditBookingForm;