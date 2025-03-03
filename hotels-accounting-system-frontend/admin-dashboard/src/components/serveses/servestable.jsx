import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "react-bootstrap";

function ServicesTable({ services, onEdit, onDelete, refreshServices }) {
  const { t } = useTranslation("services");
//   const [servicesList, setServicesList] = useState(services);  // Services state

  // Fetch services function
//   const fetchServices = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         console.error("No token found. Please log in.");
//         return;
//       }

//       const response = await fetch("http://localhost:8000/api/services", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch services");
//       }

//       const data = await response.json();
//       setServicesList(data);  // Update services list with fetched data
//     } catch (error) {
//       console.error("Error fetching services:", error);
//     }
//   };

  // useEffect to refetch services whenever servicesList changes
//   useEffect(() => {
//     fetchServices();  // Fetch services after adding/editing/deleting
//   }, [servicesList]);  // Dependency on servicesList state

  // handle adding, editing, and deleting services
//   const handleAddService = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         console.error("No token found.");
//         return;
//       }

//       const response = await fetch("http://localhost:8000/api/services", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: serviceName,
//           price: servicePrice,
//         }),
//       });

//       if (response.ok) {
//         const newService = await response.json();
//         setServicesList([...servicesList, newService]);  // Optimistically add the new service
//       }

//       setSuccessMessage(t("ServiceAddedSuccessfully"));
//       setTimeout(() => setSuccessMessage(""), 3000);
//     } catch (error) {
//       console.error("Error adding service:", error);
//     }
//   };

//   const handleUpdateService = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         console.error("No token found");
//         return;
//       }

//       const response = await fetch(
//         `http://localhost:8000/api/services/${editService.id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             name: serviceName,
//             price: servicePrice,
//           }),
//         }
//       );

//       if (response.ok) {
//         const updatedService = await response.json();
//         const updatedServices = servicesList.map((service) =>
//           service.id === updatedService.id
//             ? { ...service, name: serviceName, price: servicePrice }
//             : service
//         );
//         setServicesList(updatedServices);
//       }

//       setSuccessMessage(t("ServiceUpdatedSuccessfully"));
//       setTimeout(() => setSuccessMessage(""), 3000);
//     } catch (error) {
//       console.error("Error updating service:", error);
//     }
//   };

//   const handleDeleteService = async (id) => {
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         console.error("No token found");
//         return;
//       }

//       const response = await fetch(
//         `http://localhost:8000/api/services/${id}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         setServicesList(servicesList.filter((service) => service.id !== id));
//       }

//       setSuccessMessage(t("ServiceDeletedSuccessfully"));
//       setTimeout(() => setSuccessMessage(""), 3000);
//     } catch (error) {
//       console.error("Error deleting service:", error);
//     }
//   };

  return (
    <div className="m-10 border border-gray-700 rounded-md bg-gray-800 p-4" style={{ direction: "ltr" }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {["ServiceID", "ServiceName", "Price", "Actions"].map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {services.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No services available.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 text-sm text-gray-100">{service.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-100">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-100">{service.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-100">
                    <button onClick={() => onEdit(service)} className="text-indigo-400 hover:text-indigo-300 mr-4" aria-label={`Edit ${service.name}`}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(service.id)} className="text-red-400 hover:text-red-300" aria-label={`Delete ${service.name}`}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServicesTable;
