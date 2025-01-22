import React from 'react';

import Header from '../components/Header';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import axios from 'axios';
import { Users, User, School, Book } from 'lucide-react';
import BookingsTable from '../components/Bookings/BookingsTable';

function Bookings() {
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [bookings, setBookings] = React.useState([]);
  const [totalBookings, setTotalBookings] = React.useState(0);
  const [totalBookingsToday, setTotalBookingsToday] = React.useState(0);
  const [totalGuests, setTotalGuests] = React.useState(0);
  const [totalRooms, setTotalRooms] = React.useState(0);

  React.useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    axios.get('http://127.0.0.1:8000/api/bookings')
      .then(response => {
        setTotalBookings(response.data.length);
        setBookings(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });

    axios.get('http://127.0.0.1:8000/api/guests')
      .then(response => {
        setTotalGuests(response.data.length);
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });

    axios.get('http://127.0.0.1:8000/api/rooms')
      .then(response => {
        setTotalRooms(response.data.length);
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });

    axios.get('http://127.0.0.1:8000/api/bookingsQuery/today')
      .then(response => {
        if (response.data.data && response.data.data.length === 0) {
          setTotalBookingsToday(0);
        } else {
          setTotalBookingsToday(response.data.length);
        }
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });
  }, []);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Bookings' />
      {error && <p>{error}</p>}
      {loading ? <p>Loading...</p> : (
        <>
          <motion.div
            className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 m-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard name="Rooms" value={totalRooms} icon={School} color="#34d399" />
            <StatCard name="Bookings" value={totalBookings} icon={Users} color="#34d399" />
            <StatCard name="Bookings for today" value={totalBookingsToday} icon={Book} color="#34d399" />
            <StatCard name="Guests" value={totalGuests} icon={User} color="#34d399" />
          </motion.div>
          <BookingsTable/>
        </>
      )}

    </div>
  );
}

export default Bookings;
