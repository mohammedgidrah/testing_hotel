// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { useTranslation } from "react-i18next";
// import axios from "axios";

// const AddGuestModal = ({ show, onClose, initialName, handleClose }) => {
//   const { t, i18n } = useTranslation("reception");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [error, setError] = useState("");
//   const [guests, setGuests] = useState([]);
//   const [selectedGuestName, setSelectedGuestName] = useState("");
//   const [showAddGuest, setShowAddGuest] = useState(false);

//   // If a name was already entered, split it to prefill the fields.
//   useEffect(() => {
//     if (initialName) {
//       const parts = initialName.split(" ");
//       setFirstName(parts[0] || "");
//       setLastName(parts.slice(1).join(" ") || "");
//     }
//   }, [initialName]);

//   const resetForm = () => {
//     setFirstName("");
//     setLastName("");
//     setEmail("");
//     setPhone("");
//     setAddress("");
//     setError(""); // Reset error when form is reset
//   };

//   const fetchGuests = async (query) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/guests?search=${query}`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );
//       setGuests(Array.isArray(response.data) ? response.data : []);
//       setShowAddGuest(response.data.length === 0);
//     } catch (error) {
//       console.error("Error fetching guests:", error);
//       setGuests([]);
//       setShowAddGuest(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedGuestName.length > 1) {
//       const delayDebounceFn = setTimeout(() => {
//         fetchGuests(selectedGuestName);
//       }, 500);

//       return () => clearTimeout(delayDebounceFn);
//     }
//   }, [selectedGuestName]);

//   const handleAddGuest = async () => {
//     setError("");
//     try {
//       const response = await fetch("http://localhost:8000/api/guests", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           first_name: firstName,
//           last_name: lastName,
//           email: email,
//           phone_number: phone,
//           address: address,
//         }),
//       });

//       if (!response.ok) {
//         const err = await response.text();
//         throw new Error(err);
//       }

//       const newGuest = await response.json();
//       onClose(); // Close modal after successful addition
//       resetForm(); // Reset form fields
//     } catch (error) {
//       console.error("Error adding guest:", error);
//       setError(t("AddGuestFailed") || "Failed to add guest");
//     }
//   };

//   return (
//     <Modal
//       show={show}
//       onHide={() => {
//         handleClose(); // Using the passed handleClose function
//         resetForm();
//       }}
//     >
//       <Modal.Header
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Modal.Title>{t("AddGuest")}</Modal.Title>
//         <Button
//           variant="close"
//           onClick={() => {
//             handleClose();
//             resetForm();
//           }}
//           aria-label="Close"
//           style={i18n.language === "ar" ? { margin: 0 } : {}}
//         />
//       </Modal.Header>

//       <Modal.Body>
//         <Form>
//           <Form.Group className="mb-3">
//             <Form.Label>{t("FirstName")}</Form.Label>
//             <Form.Control
//               type="text"
//               value={firstName}
//               onChange={(e) => setFirstName(e.target.value)}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>{t("LastName")}</Form.Label>
//             <Form.Control
//               type="text"
//               value={lastName}
//               onChange={(e) => setLastName(e.target.value)}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>{t("email")}</Form.Label>
//             <Form.Control
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>{t("phone")}</Form.Label>
//             <Form.Control
//               type="text"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>{t("address")}</Form.Label>
//             <Form.Control
//               type="text"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//             />
//           </Form.Group>
//           {error && <div className="alert alert-danger">{error}</div>}
//         </Form>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button
//           variant="secondary"
//           onClick={() => {
//             handleClose();
//             resetForm();
//           }}
//         >
//           {t("cancel")}
//         </Button>
//         <Button variant="primary" onClick={handleAddGuest}>
//           {t("AddGuest")}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default AddGuestModal;
