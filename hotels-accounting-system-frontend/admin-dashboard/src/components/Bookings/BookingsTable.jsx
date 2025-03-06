import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Search, Eye } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "react-bootstrap";
import EditBookingForm from "./EditBookingForm";

function BookingsTable() {
  const { t, i18n } = useTranslation("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [bookingsRes, roomsRes, guestsRes] = await Promise.all([
  //         axios.get("http://127.0.0.1:8000/api/rooms", {
  //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         }),
  //         axios.get("http://127.0.0.1:8000/api/guests", {
  //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         }),
  //         axios.get("http://127.0.0.1:8000/api/bookings", {
  //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         })
          
  //       ]);
  //        setFilteredBookings(bookingsRes.data);
  //       setRooms(roomsRes.data);
  //       setGuests(guestsRes.data);
  //     } catch (err) {
  //       setError(t("fetchError"));
  //     }
  //   };
  //   fetchData();
  // }, []); // ✅ Dependency array ensures it runs only once
  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFilteredBookings(response.data);
      setBookings(response.data);
    } catch (err) {
      setError(t("fetchError"));
    }
  }
  const fetchguests = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/guests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGuests(response.data);
    } catch (err) {
      setError(t("fetchError"));
    }
  }
  const fetchrooms = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/rooms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRooms(response.data);
    } catch (err) {
      setError(t("fetchError"));
    }
  }
  useEffect(() => {
    fetchBookings();
    fetchguests();
    fetchrooms();
    // handleUpdateBooking();
  }, []);



  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = bookings.filter((booking) => {
      const guestName =
        `${booking.guests.first_name} ${booking.guests.last_name}`.toLowerCase();
      const roomNumber = booking.room.room_number.toLowerCase();
      const bookingid = booking.id.toString().toLowerCase();
      return (
        guestName.includes(term) ||
        roomNumber.includes(term) ||
        bookingid.includes(term)
      );
    });
    setFilteredBookings(filtered);
  };

  const handleDelete = () => {
    if (selectedBookingId) {
      axios
        .delete(`http://127.0.0.1:8000/api/bookings/${selectedBookingId}`)
        .then(() => {
          setBookings((prev) =>
            prev.filter((booking) => booking.id !== selectedBookingId)
          );
          setFilteredBookings((prev) =>
            prev.filter((booking) => booking.id !== selectedBookingId)
          );
          setShowModal(false);
        })
        .catch(() => {
          setError(t("deleteError"));
        });
    }
  };

  const handleShowDetails = async (booking) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/bookings/${booking.id}/services`
      );
      const bookingWithServices = {
        ...booking,
        services: response.data,
      };
      setSelectedBookingDetails(bookingWithServices);
      setShowDetailsModal(true);
    } catch (error) {
      setError(t("serviceFetchError"));
    }
  };

  const handleUpdateBooking = (updatedBooking) => {
    setBookings((prevBookings) =>
      prevBookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ direction: "ltr" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          {t("BookingList")}
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder={t("Search")}
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-80 sm:w-40"
            onChange={handleSearch}
            value={searchTerm}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {[
                "ID",
                "GuestName",
                "RoomNumber",
                "CheckInDate",
                "CheckOutDate",
                "TotalAmount",
                "Status",
                "Details",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {t(header)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {error && <p className="text-red-500">{error}</p>}
            {filteredBookings.map((booking) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {`${booking.guest.first_name} ${booking.guest.last_name}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {booking.room.room_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(booking.check_in_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(booking.check_out_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${parseFloat(booking.total_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {t(booking.payment_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => handleShowDetails(booking)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Eye size={20} />
                  </button>
                </td>
                <td className="flex px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowEditModal(true);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBookingId(booking.id);
                      setShowModal(true);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <EditBookingForm
          booking={selectedBooking}
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedBooking(null);
          }}
          onUpdate={handleUpdateBooking}
          rooms={rooms}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        style={{ direction: "ltr" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("DeleteBooking")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("AreYouSure")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("Cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        style={{ direction: "ltr" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("BookingDetails")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBookingDetails && (
            <div>
              <p>
                <strong>{t("ID")}:</strong> {selectedBookingDetails.id}
              </p>
              <p
                style={
                  i18n.language === "ar"
                    ? { direction: "rtl", textAlign: "left" }
                    : {}
                }
              >
                <strong>{t("GuestName")}:</strong>{" "}
                {`${selectedBookingDetails.guest.first_name} ${selectedBookingDetails.guest.last_name}`}
              </p>
              <p>
                <strong>{t("RoomNumber")}:</strong>{" "}
                {selectedBookingDetails.room.room_number}
              </p>
              <p>
                <strong>{t("CheckInDate")}:</strong>{" "}
                {new Date(
                  selectedBookingDetails.check_in_date
                ).toLocaleDateString()}
              </p>
              <p>
                <strong>{t("CheckOutDate")}:</strong>{" "}
                {new Date(
                  selectedBookingDetails.check_out_date
                ).toLocaleDateString()}
              </p>
              <p>
                <strong>{t("TotalAmount")}:</strong> $
                {parseFloat(selectedBookingDetails.total_amount).toFixed(2)}
              </p>
              <p>
                <strong>{t("Status")}:</strong>{" "}
                {t(selectedBookingDetails.payment_status)}
              </p>

              {/* Display Services */}
              <div>
                <strong>{t("Services")}:</strong>
                {selectedBookingDetails.services &&
                selectedBookingDetails.services.length > 0 ? (
                  <ul>
                    {selectedBookingDetails.services.map((service) => (
                      <li key={service.id}>
                        {service.name} - ${parseFloat(service.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t("NoServicesSelected")}</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default BookingsTable;
