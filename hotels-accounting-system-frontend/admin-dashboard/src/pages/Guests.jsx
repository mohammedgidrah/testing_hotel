import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import GuestTable from "../components/Guests/gueststable";

function Guests() {
  const { t, i18n } = useTranslation("guests");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [editingGuest, setEditingGuest] = useState(null);
  const buttonClass = i18n.language === "ar" ? "ml-2" : ""; // Adding margin-left in Arabic

  const [newGuest, setNewGuest] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        const response = await axios.get("http://127.0.0.1:8000/api/guests");
        setGuests(response.data);
        setFilteredGuests(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchGuests();
  }, []);

  useEffect(() => {
    const filtered = guests.filter((guest) => {
      const searchIn =
        filterBy === "all"
          ? `${guest.first_name} ${guest.last_name} ${guest.email} ${guest.phone_number} ${guest.address}`
          : guest[filterBy];
      return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredGuests(filtered);
  }, [searchTerm, filterBy, guests]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGuest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrEditGuest = async (e) => {
    e.preventDefault(); // Prevent form refresh

    if (editingGuest) {
      // If editing a guest, update the guest
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/guests/${editingGuest.id}`,
          newGuest, // Use newGuest data for editing
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedGuests = guests.map((guest) =>
          guest.id === response.data.id ? response.data : guest
        );
        setGuests(updatedGuests);
        setEditingGuest(null); // Reset editing state
        setNewGuest({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          address: "",
        }); // Reset form state
        setShowForm(false);
      } catch (error) {
        console.error(error);
        setError("Failed to update guest");
      }
    } else {
      // If adding a new guest, add to the list
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/guests",
          newGuest,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setGuests([...guests, response.data]);
        setNewGuest({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          address: "",
        });
        setShowForm(false);
      } catch (error) {
        console.error(error);
        setError("Failed to add guest");
      }
    }
  };

  const handleDeleteGuest = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/guests/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setGuests(guests.filter((guest) => guest.id !== id));
    } catch (error) {
      console.error(error);
      setError("Failed to delete guest");
    }
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setNewGuest({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone_number: guest.phone_number,
      address: guest.address,
    });
    setShowForm(true); // Show the form for editing
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("Guests")} />

      <div className="flex-1 mx-auto py-4 px-4" >
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading && <div className="text-gray-300 mb-4">Loading...</div>}

        <div className="flex items-center mb-4">
          <input
          style={i18n.language === 'ar' ? { marginLeft: 10 } : { }}
            type="text"
            placeholder={t("Search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("AllFields")}</option>
            <option value="first_name">{t("FirstName")}</option>
            <option value="last_name">{t("LastName")}</option>
            <option value="email">{t("Email")}</option>
            <option value="phone_number">{t("PhoneNumber")}</option>
            <option value="address">{t("Address")}</option>
          </select>

          <button
            style={i18n.language === "en" ? { marginLeft: "auto" } : {marginRight: "auto"}}
            onClick={() => setShowForm((prev) => !prev)}
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg justify-self-end "
          >
            {t(showForm ? "HideForm" : "AddGuest")}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mr-4 ml-4 mx-auto m-4">
            <form onSubmit={handleAddOrEditGuest}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("FirstName")}
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={newGuest.first_name}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 mb-2 w-full rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("LastName")}
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={newGuest.last_name}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 mb-2 w-full rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">{t("Email")}</label>
                <input
                  type="email"
                  name="email"
                  value={newGuest.email}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 mb-2 w-full rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("PhoneNumber")}
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={newGuest.phone_number}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 mb-2 w-full rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("Address")}
                </label>
                <input
                  type="text"
                  name="address"
                  value={newGuest.address}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 mb-2 w-full rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
              >
                {editingGuest ? t("UpdateGuest") : t("AddGuest")}
              </button>
            </form>
          </div>
        )}

        <GuestTable
          loading={loading}
          filteredGuests={filteredGuests}
          setEditingGuest={handleEditGuest}
          handleDeleteGuest={handleDeleteGuest}
          t={t}
        />
      </div>
    </div>
  );
}

export default Guests;
