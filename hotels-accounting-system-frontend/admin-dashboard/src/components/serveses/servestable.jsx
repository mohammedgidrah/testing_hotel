import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "react-bootstrap";

function ServicesTable({ services, onEdit, onDelete, refreshServices }) {
  const { t } = useTranslation("services");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;

  const totalPages = Math.ceil(services.length / servicesPerPage);
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(indexOfFirstService, indexOfLastService);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 🔁 Automatically go to previous page if current is empty and not page 1
  useEffect(() => {
    if (currentServices.length === 0 && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  }, [currentServices, currentPage]);

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
            {currentServices.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No services available.
                </td>
              </tr>
            ) : (
              currentServices.map((service) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === index + 1
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServicesTable;
