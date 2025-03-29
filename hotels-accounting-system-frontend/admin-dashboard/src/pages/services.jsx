import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import Servestable from "../components/serveses/servestable";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

export default function Services() {
  const { t } = useTranslation("services");

  // State management
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
  
      // Check if the token is available
      if (!token) {
        console.error("No token found. Please log in.");
        // Optionally, redirect to the login page or show a message
        return;
      }
  
      const response = await fetch("http://localhost:8000/api/services", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure the token is included in the request header
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
  
      const data = await response.json(); // Parse the response as JSON
      setServices(data); // Update the state with the fetched services
    } catch (error) {
      console.error("Error fetching services:", error);
  
      // Handle unauthorized error (401)
      if (error.message === "Failed to fetch services") {
        console.error("An error occurred while fetching services.");
      }
  
      // Handle other errors (e.g., server issues, etc.)
      if (error.message !== "Failed to fetch services") {
        console.error("An unexpected error occurred.");
      }
    }
  };
  
  

  const toggleForm = () => {
    setShowForm(!showForm);
    setEditService(null);
    setServiceName("");
    setServicePrice("");
    setSuccessMessage(""); // Clear success message when toggling the form
  };

  // Handle adding a new service
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
  
      // Check if the token is available
      if (!token) {
        console.error("No token found");
        return; // You can show an error message to the user or redirect to login page
      }
  
      const response = await fetch("http://localhost:8000/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ensure the token is included in the request header
        },
        body: JSON.stringify({
          name: serviceName,
          price: servicePrice,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add the service");
      }
  
      const data = await response.json(); // Parse the response as JSON
  
      setServices([...services, data]); // Add the new service to the state
      setSuccessMessage(t("ServiceAddedSuccessfully")); // Set success message
      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
      toggleForm();
    } catch (error) {
      console.error("Error adding service:", error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized request, please log in.");
        // Optionally, redirect to login page or show a message
      }
    }
  };
  
  
 
  // Handle updating an existing service
  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!editService) return;
  
    // Optimistic UI update: immediately update the service in the list
    const updatedServices = services.map((service) =>
      service.id === editService.id
        ? { ...service, name: serviceName, price: servicePrice }
        : service
    );
    setServices(updatedServices);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
  
      const response = await fetch(
        `http://localhost:8000/api/services/${editService.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: serviceName,
            price: servicePrice,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update the service");
      }
  
      setSuccessMessage(t("ServiceUpdatedSuccessfully"));
      setTimeout(() => setSuccessMessage(""), 3000);
      toggleForm();
      // Fetch updated services only if the backend operation is successful
    //   fetchServices();
    } catch (error) {
      console.error("Error updating service:", error);
      setServices(services); // Reset to previous state if update fails
    }
  };
  
  
  

  const handleEdit = (service) => {
    setEditService(service);
     setServiceName(service.name);
    setServicePrice(service.price);
    setShowForm(true);
    
  };

  // Handle delete confirmation
  const openDeleteModal = (serviceId) => {
    setServiceToDelete(serviceId);
    setShowModal(true);
  };

  // Handle deleting a service
  const handleDelete = async () => {
    if (!serviceToDelete) return;
  
    try {
      const token = localStorage.getItem("token");
  
      // Check if the token is available
      if (!token) {
        console.error("No token found");
        return; // Optionally, show an error message or redirect the user to login
      }
  
      const response = await fetch(
        `http://localhost:8000/api/services/${serviceToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is included in the request header
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to delete the service");
      }
  
      setSuccessMessage(t("ServiceDeletedSuccessfully")); // Set success message
      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
      setShowModal(false);
      fetchServices(); // Refresh the service list after deleting
    } catch (error) {
      console.error("Error deleting service:", error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized request, please log in.");
        // Optionally, redirect to login page or show a message
      }
    }
  };
  

  return (
    <div className="flex-1 overflow-auto relative z-10" style={{direction: "ltr"}}>
      <Header title={t("Services")} />

      <div className="flex justify-end items-center mt-4 mr-4 ml-4">
      <button
          onClick={toggleForm}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {showForm
            ? t("HideForm")
            : editService
            ? t("UpdateService")
            : t("AddService")}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}

{showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mx-4">
          <form onSubmit={editService ? handleUpdateService : handleAddService}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">{t("ServiceName")}</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">{t("Price")}</label>
              <input
                type="number"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
            >
              {editService ? t("UpdateService") : t("AddService")}
            </button>
          </form>
        </div>
      )}

      {/* <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        style={{ direction: "ltr" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("DeleteService")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("DeleteConfirmation")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("delete")}
          </Button>
        </Modal.Footer>
      </Modal> */}
           {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h3 className="text-xl text-white mb-4">{t("DeleteConfirmation")}</h3>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                {t("cancel")}
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                {t("delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

      {/* Services Table */}
      <Servestable
        services={services}
        onDelete={openDeleteModal}
        onEdit={handleEdit}
        refreshServices={fetchServices}
      />
    </div>
  );
}

