import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function EditPayment({
  show,
  payment,
  onClose,
  onPaymentUpdated,
}) {
  const { t, i18n } = useTranslation("payments");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);

  // Fetch payments function
  const fetchPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(response.data);
    } catch (error) {
      setError("Failed to load payments. Please try again.");
      console.error("Error fetching payments:", error.response || error);
    }
  }, []);
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Update state when a new payment is selected
  useEffect(() => {
    if (payment) {
      setPaymentAmount(payment.amount_paid || "");
      setPaymentDate(
        payment.created_at ? payment.created_at.split("T")[0] : ""
      );
      setPaymentMethod(payment.payment_method || "");
    }
  }, [payment]);

  // Function to save payment data
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:8000/api/payments/${payment.id}`,
        {
          amount_paid: paymentAmount,
          created_at: paymentDate,
          payment_method: paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch the latest payments data
      fetchPayments();

      // Update the current payment object (optional - could be handled in parent)
      if (onPaymentUpdated) {
        onPaymentUpdated({
          ...payment,
          amount_paid: paymentAmount,
          created_at: paymentDate,
          payment_method: paymentMethod,
        });
      }

      onClose(); // Close modal after saving
    } catch (error) {
      console.error("Error updating payment:", error);
      alert(t("Error updating payment"));
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header
        closeButton
        style={i18n.language === "ar" ? { direction: "ltr" } : {}}
      >
        <Modal.Title>{t("editpayment")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentAmount")}</Form.Label>
            <Form.Control
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentDate")}</Form.Label>
            <Form.Control
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentMethod")}</Form.Label>
            <Form.Control
              as="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="credit_card">{t("CreditCard")}</option>
              <option value="cash">{t("Cash")}</option>
              {/* Add other payment methods as needed */}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
