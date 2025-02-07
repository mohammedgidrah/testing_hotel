import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react'; // Import icons
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button components from react-bootstrap
import { motion } from 'framer-motion';

export default function GuestTable({ loading, filteredGuests, setEditingGuest, handleDeleteGuest, t }) {
  const [showModal, setShowModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);

  const handleDelete = () => {
    if (guestToDelete) {
      handleDeleteGuest(guestToDelete.id);
      setShowModal(false);
    }
  };

  return (
    <div>
      {!loading && filteredGuests.length > 0 ? (
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
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.phone_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.address}</td>
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
        </div>
      ) : (
        !loading && (
          <div className="text-red-400 text-sm">{t("NoGuestsFound")}</div>
        )
      )}

      {/* Bootstrap Modal for confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)} style={{ direction: "ltr" }}>
        <Modal.Header closeButton>
          <Modal.Title>{t("DeleteGuest")}</Modal.Title>
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
      </Modal>
    </div>
  );
}
