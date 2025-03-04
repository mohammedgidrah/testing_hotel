import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Form } from 'react-bootstrap';

function EditBookingForm({ booking, show, onHide, onUpdate }) {
    const { t } = useTranslation("bookings");
    const [formData, setFormData] = useState({
        guest_first_name: booking.guest.first_name,
        guest_last_name: booking.guest.last_name,
        room_number: booking.room.room_number,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_amount: booking.total_amount,
        payment_status: booking.payment_status,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://127.0.0.1:8000/api/bookings/${booking.id}`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => {
                onUpdate(response.data); // Notify parent component of the update
                onHide(); // Close the modal
            })
            .catch(() => {
                alert('Failed to update booking');
            });
    };

    return (
        <Modal show={show} onHide={onHide} style={{ direction: "ltr" }}>
            <Modal.Header closeButton>
                <Modal.Title>{t("EditBooking")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("GuestFirstName")}</Form.Label>
                        <Form.Control
                            type="text"
                            name="guest_first_name"
                            value={formData.guest_first_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("GuestLastName")}</Form.Label>
                        <Form.Control
                            type="text"
                            name="guest_last_name"
                            value={formData.guest_last_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("RoomNumber")}</Form.Label>
                        <Form.Control
                            type="text"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("CheckInDate")}</Form.Label>
                        <Form.Control
                            type="date"
                            name="check_in_date"
                            value={formData.check_in_date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("CheckOutDate")}</Form.Label>
                        <Form.Control
                            type="date"
                            name="check_out_date"
                            value={formData.check_out_date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("TotalAmount")}</Form.Label>
                        <Form.Control
                            type="number"
                            name="total_amount"
                            value={formData.total_amount}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("PaymentStatus")}</Form.Label>
                        <Form.Select
                            name="payment_status"
                            value={formData.payment_status}
                            onChange={handleChange}
                            required
                        >
                            <option value="pending">{t("Pending")}</option>
                            <option value="paid">{t("Paid")}</option>
                            <option value="cancelled">{t("Cancelled")}</option>
                        </Form.Select>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        {t("SaveChanges")}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EditBookingForm;