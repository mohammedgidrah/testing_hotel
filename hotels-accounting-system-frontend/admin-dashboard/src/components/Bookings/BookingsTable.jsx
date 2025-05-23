import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Search, Eye, Plus } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "react-bootstrap";
import EditBookingForm from "./EditBookingForm";
import { useNavigate } from "react-router-dom";

function BookingsTable({ ondelete }) {
  const navigate = useNavigate();
  const [filteredBookings, setFilteredBookings] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    if (currentBookings.length === 0 && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  }, [currentBookings, currentPage]);
  // end pagination
  const { t, i18n } = useTranslation("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showArrivals, setShowArrivals] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
    const [bookingToDelete, setBookingToDelete] = useState(null);
  

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    // Parse the date string while considering it as UTC
    const date = new Date(dateString + "Z"); // Append 'Z' to treat it as UTC

    // Extract day, month, and year
    const day = String(date.getUTCDate()).padStart(2, "0"); // Ensure two digits
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  //  const fetchBookings = async () => {
  //   try {
  //     const response = await axios.get("http://127.0.0.1:8000/api/bookings", {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //     });
  //     setBookings(response.data);
  //   } catch (err) {
  //     setError(t("fetchError"));
  //   }
  //  };
  //  useEffect(() => {

  //  })
  const fetchPayments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/payments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments(response.data);
    } catch (err) {
      setError(t("fetchError"));
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBookings(response.data);
      filterBookings(response.data, searchTerm, showArrivals);
    } catch (err) {
      setError(t("fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchrooms = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/rooms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRooms(response.data);
    } catch (err) {
      setError(t("fetchError"));
    }
  };
 
  useEffect(() => {
    fetchBookings();
    fetchrooms();
    fetchPayments();
  }, []);

  // Apply filters when search term or showArrivals changes
  useEffect(() => {
    filterBookings(bookings, searchTerm, showArrivals);
  }, [searchTerm, showArrivals]);

  const filterBookings = (bookingsData, term, showTodayArrivals) => {
    let filtered = [...bookingsData];

    // Apply search filter if search term exists
    if (term) {
      const searchTermLower = term.toLowerCase();
      filtered = filtered.filter((booking) => {
        if (!booking.guest) return false;

        const guestName =
          `${booking.guest.first_name} ${booking.guest.last_name}`.toLowerCase();
        const roomNumber = booking.room?.room_number?.toLowerCase() || "";
        const bookingId = booking.id.toString().toLowerCase();

        return (
          guestName.includes(searchTermLower) ||
          roomNumber.includes(searchTermLower) ||
          bookingId.includes(searchTermLower)
        );
      });
    }

    // Apply arrivals filter if showArrivals is true
    if (showTodayArrivals) {
      // Get today's date in the format YYYY-MM-DD
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayFormatted = `${year}-${month}-${day}`;

      // Filter for bookings where check-in date is today
      filtered = filtered.filter((booking) => {
        if (!booking.check_in_date) return false;
        // Format booking check-in date to compare with today
        const checkInDate = booking.check_in_date.split("T")[0];
        return checkInDate === todayFormatted;
      });
    }

    setFilteredBookings(filtered);
  };
 
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleDelete = () => {
    if (selectedBookingId) {
      axios
        .delete(`http://127.0.0.1:8000/api/bookings/${selectedBookingId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          setBookings((prev) =>
            prev.filter((booking) => booking.id !== selectedBookingId)
          );
          filterBookings(
            bookings.filter((booking) => booking.id !== selectedBookingId),
            searchTerm,
            showArrivals
          );
          setShowModal(false);
        })
        .catch(() => {
          setError(t("deleteError"));
        });
    }
  };

  const openDeleteModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowModal(true);
  };
  const handleShowDetails = async (booking) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/bookings/${booking.id}/services`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
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
    // Find the current booking with all its nested data
    const existingBooking = bookings.find((b) => b.id === updatedBooking.id);

    // Create a properly merged booking that preserves nested objects
    const mergedBooking = {
      ...existingBooking,
      ...updatedBooking,
      // Ensure room data is preserved
      room: updatedBooking.room || existingBooking.room,
      // Ensure guest data is preserved
      guest: updatedBooking.guest || existingBooking.guest,
    };

    // Update the bookings state with the merged booking
    const updatedBookings = bookings.map((b) =>
      b.id === updatedBooking.id ? mergedBooking : b
    );

    setBookings(updatedBookings);

    // Re-apply filters to updated bookings list
    filterBookings(updatedBookings, searchTerm, showArrivals);

    // Re-fetch payments after a booking update
    fetchPayments();
  };

  const handleShowArrivals = () => {
    setShowArrivals(!showArrivals);
  };

  return (
    <>
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ direction: "ltr" }}
    >
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          {t("BookingList")} {showArrivals && `- ${t("TodayArrivals")}`}
        </h2>
        <button
          className={`${
            showArrivals
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white py-2 px-4 rounded-lg transition-colors`}
          onClick={handleShowArrivals}
        >
          {showArrivals ? t("allbookings") : t("TodayArrivals")}
        </button>
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
  

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">{t("Loading")}...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {showArrivals
            ? t("NoArrivalsToday")
            : searchTerm
            ? t("NoMatchingBookings")
            : t("NoBookingsFound")}
        </div>
      ) : (
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
                  "paymentMethod",
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
              {error && (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 text-red-500 text-center"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {currentBookings.map((booking) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={showArrivals ? "bg-green-900 bg-opacity-20" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {booking.guest
                      ? `${booking.guest.first_name} ${booking.guest.last_name}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.room?.room_number || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.check_in_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.check_out_date)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${parseFloat(booking.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {t(booking.payment_status || "pending")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {payments.find(
                      (payment) => payment.booking_id === booking.id
                    )?.payment_method || t("No Payment")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => handleShowDetails(booking)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Eye size={20} />
                    </button>
                  </td>

                  <td className="flex justify-ar px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowEditModal(true);
                      }}
                      className="text-blue-500 hover:text-indigo-300 mr-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        openDeleteModal(booking.id);
                      }}
                      className="text-red-500 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        navigate("/booking-items", {
                          state: { bookingId: booking.id }, // Pass booking ID in route state
                        });
                      }}
                      className="text-yellow-500 hover:text-red-300"
                    >
                      <Plus size={18} />
                    </button>
                  </td>
                </motion.tr>
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
      )}

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

      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        style={{ direction: "ltr" }}
      >
        <Modal.Header
          closeButton
          className="bg-gray-800 text-xl font-bold text-white border-none custom-close"
        >
          <Modal.Title>{t("BookingDetails")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800 text-x text-gray-200 text-opacity-80">
          {selectedBookingDetails && (
            <div>
              <p className="text-gray-300">
                <strong style={{ color: "white", fontWeight: "bold" }}>
                  {t("ID")}:
                </strong>{" "}
                {selectedBookingDetails.id}
              </p>
              <p
                style={
                  i18n.language === "ar"
                    ? { direction: "rtl", textAlign: "left" }
                    : {}
                }
                className="text-gray-300"
              >
                <strong className="font-bold text-white">
                  {t("GuestName")}:
                </strong>{" "}
                {selectedBookingDetails.guest
                  ? `${selectedBookingDetails.guest.first_name} ${selectedBookingDetails.guest.last_name}`
                  : "N/A"}
              </p>
              <p className="text-gray-300">
                <strong className="font-bold text-white">
                  {t("RoomNumber")}:
                </strong>{" "}
                {selectedBookingDetails.room?.room_number || "N/A"}
              </p>
              <p className="text-gray-300">
                <strong className="font-bold text-white">
                  {t("CheckInDate")}:
                </strong>{" "}
                {selectedBookingDetails.check_in_date
                  ? new Date(
                      selectedBookingDetails.check_in_date
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-300">
                <strong className="font-bold text-white">
                  {t("CheckOutDate")}:
                </strong>{" "}
                {selectedBookingDetails.check_out_date
                  ? new Date(
                      selectedBookingDetails.check_out_date
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-300">
                <strong className="font-bold text-white">
                  {t("TotalAmount")}:
                </strong>{" "}
                $
                {parseFloat(selectedBookingDetails.total_amount || 0).toFixed(
                  2
                )}
              </p>
              <p className="text-gray-300">
                <strong className="font-bold text-white">{t("Status")}:</strong>{" "}
                {t(selectedBookingDetails.payment_status || "pending")}
              </p>

              {/* Display Services */}
              <div>
                <strong className="font-bold text-white">
                  {t("Services")}:
                </strong>
                {selectedBookingDetails.services &&
                selectedBookingDetails.services.length > 0 ? (
                  <ul>
                    {selectedBookingDetails.services.map((service) => (
                      <li key={service.id}>
                        <span className="font-bold text-white">
                          {service.name}{" "}
                        </span>
                        {" - $"}
                        {parseFloat(service.price || 0).toFixed(2)}
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
        <Modal.Footer className="  bg-gray-800 text-white  p-2 pr-10  border-none  ">
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
        {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          style={{ direction: "ltr" }}
        >
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl text-white mb-4">{t("AreYouSure")}</h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    
  );
}

export default BookingsTable;
