import React, { useEffect, useState } from "react";
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
  const [formData, setFormData] = useState({
    amount_paid: "",
    payment_date: "",
    payment_method: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when payment changes
  useEffect(() => {
    if (payment) {
      const paymentDate = payment.payment_date 
        ? new Date(payment.payment_date).toISOString().split('T')[0]
        : '';
        
      setFormData({
        amount_paid: payment.amount_paid || "",
        payment_date: paymentDate,
        payment_method: payment.payment_method || "",
      });
    }
  }, [payment]);

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const { data: updatedPayment } = await axios.put(
        `http://127.0.0.1:8000/api/payments/${payment.id}`,
        {
          ...formData,
          amount_paid: Number(formData.amount_paid),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onPaymentUpdated) {
        onPaymentUpdated(updatedPayment);
      }

      onClose();
    } catch (error) {
      console.error("Update error:", error);
      setError(error.response?.data?.message || t("updateError") || "Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        {error && <div className="alert alert-danger">{error}</div>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentAmount")}</Form.Label>
            <Form.Control
              name="amount_paid"
              type="number"
              step="0.01"
              value={formData.amount_paid}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentDate")}</Form.Label>
            <Form.Control
              name="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("PaymentMethod")}</Form.Label>
            <Form.Control
              as="select"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">{t("select_method")}</option>
              <option value="credit_card">{t("creditcard")}</option>
              <option value="cash">{t("cash")}</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {t("cancel")}
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? t("saving...") : t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}