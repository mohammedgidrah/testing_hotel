import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react"; // Import icons
import { Modal, Button } from "react-bootstrap"; // Import Modal and Button components from react-bootstrap
import { motion } from "framer-motion";

export default function GuestTable({
  loading,
  filteredGuests,
  setEditingGuest,
  handleDeleteGuest,
  t,
}) {
  const [showModal, setShowModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const guestsPerPage = 5;

  const indexOfLastguests = currentPage * guestsPerPage;
  const indexOfFirstguests = indexOfLastguests - guestsPerPage;
  const currentguests = filteredGuests.slice(
    indexOfFirstguests,
    indexOfLastguests
  );

  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = () => {
    if (guestToDelete) {
      handleDeleteGuest(guestToDelete.id);
      setShowModal(false);
    }
  };

  return (
    <div>
      {!loading && currentguests.length > 0 ? (
        <div className="overflow-x-auto" style={{ direction: "ltr" }}>
          <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("FirstName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("LastName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("Email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("PhoneNumber")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("Address")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentguests.map((guest) => (
                <tr
                  key={guest.id}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {guest.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {guest.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {guest.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {guest.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {guest.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => setEditingGuest(guest)}
                      className="text-indigo-400 hover:text-indigo-300 mr-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setGuestToDelete(guest);
                        setShowModal(true);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      ) : (
        !loading && (
          <div className="text-red-400 text-sm">{t("NoGuestsFound")}</div>
        )
      )}

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ direction: "ltr" }}
        >
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl text-white mb-4">
              {t("DeleteConfirmation")}
            </h3>
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
    </div>
  );
}
