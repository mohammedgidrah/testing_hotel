import React from 'react'
import Header from '../components/Header'
import { motion } from 'framer-motion'
import StatCard from '../components/StatCard'
import axios from 'axios';
import { Zap, Users, User, DollarSign } from 'lucide-react';
import BookingChart from '../components/Dashboard/BookingChart';
import PaymentChart from '../components/Dashboard/PaymentChart';
import ExpensePieChart from '../components/Expenses/ExpensesChart';




function Dashboard() {

  const [totalSales, setTotalSales] = React.useState(0);
  const [payments, setPayments] = React.useState([]);
  const [bookings, setBookings] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [totalBookings, setTotalBookings] = React.useState(0);
  const [totalGuests, setTotalGuests] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [filterDate, setFilterDate] = React.useState('all');



  React.useEffect(() => {

    let total_Expenses = 0;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    // Fetch expenses
    axios.get('http://127.0.0.1:8000/api/expenses')
      .then(response => {

        if (filterDate == "all") {
          response.data.forEach((item) => {
            total_Expenses += JSON.parse(item.amount)
          });
          setExpenses(response.data);
        } else if (filterDate == "day") {
          let felteredExpenses = response.data.filter((item) => {
            return new Date(item.expense_date).toDateString() == new Date().toDateString();
          })
          felteredExpenses.forEach((item) => {
            total_Expenses += JSON.parse(item.amount)
          });
          setExpenses(felteredExpenses);
        } else if (filterDate == "year") {
          let felteredExpenses = response.data.filter((item) => {
            return new Date(item.expense_date).getFullYear() == new Date().getFullYear();
          })
          felteredExpenses.forEach((item) => {
            total_Expenses += JSON.parse(item.amount)
          });
          setExpenses(felteredExpenses);
        } else if (filterDate == "month") {
          let felteredExpenses = response.data.filter((item) => {
            return new Date(item.expense_date).getMonth() == new Date().getMonth();
          })
          felteredExpenses.forEach((item) => {
            total_Expenses += JSON.parse(item.amount)
            console.log(JSON.parse(item.amount))
          });
          setExpenses(felteredExpenses);
        }
        setTotalExpenses(total_Expenses);
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      })
    // Fetch guests
    axios.get('http://127.0.0.1:8000/api/guests')
      .then(response => {
        if (filterDate == "all") {
          setTotalGuests(response.data.length);
          setLoading(false);
        } else if (filterDate == "day") {
          let felteredGuests = response.data.filter((item) => {
            return new Date(item.created_at).toDateString() == new Date().toDateString();
          })
          setTotalGuests(felteredGuests.length);
          setLoading(false);
        } else if (filterDate == "year") {
          let felteredGuests = response.data.filter((item) => {
            return new Date(item.created_at).getFullYear() == new Date().getFullYear();
          })
          setTotalGuests(felteredGuests.length);
          setLoading(false);
        } else if (filterDate == "month") {
          let felteredGuests = response.data.filter((item) => {
            return new Date(item.created_at).getMonth() == new Date().getMonth();
          })
          setTotalGuests(felteredGuests.length);
          setLoading(false);
        }
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });
    let totalIncome = 0;
    axios.get('http://127.0.0.1:8000/api/payments')
      .then(response => {
        if (filterDate == "all") {
          response.data.forEach((item) => {
            totalIncome += JSON.parse(item.amount_paid)
          });
          setPayments(response.data);
        } else if (filterDate == "day") {
          let felteredPayments = response.data.filter((item) => {
            return new Date(item.payment_date).toDateString() == new Date().toDateString();
          })
          felteredPayments.forEach((item) => {
            totalIncome += JSON.parse(item.amount_paid)
          });
          setPayments(felteredPayments);
        } else if (filterDate == "year") {
          let felteredPayments = response.data.filter((item) => {
            return new Date(item.payment_date).getFullYear() == new Date().getFullYear();
          })
          felteredPayments.forEach((item) => {
            totalIncome += JSON.parse(item.amount_paid)
          });
          setPayments(felteredPayments);
        } else if (filterDate == "month") {
          let felteredPayments = response.data.filter((item) => {
            return new Date(item.payment_date).getMonth() == new Date().getMonth();
          })
          felteredPayments.forEach((item) => {
            totalIncome += JSON.parse(item.amount_paid)
          });
          setPayments(felteredPayments);
        }
        setTotalSales(totalIncome);
        setLoading(false);
        setTotalRevenue(totalIncome - total_Expenses);
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });
    axios.get('http://127.0.0.1:8000/api/bookings')
      .then(response => {
        if (filterDate == "all") {
          setTotalBookings(response.data.length);
          setLoading(false);
          setBookings(response.data);
        } else if (filterDate == "day") {
          let felteredBookings = response.data.filter((item) => {
            return new Date(item.check_in_date).toDateString() == new Date().toDateString();
          })
          setTotalBookings(felteredBookings.length);
          setLoading(false);
          setBookings(felteredBookings);
        } else if (filterDate == "year") {
          let felteredBookings = response.data.filter((item) => {
            return new Date(item.check_in_date).getFullYear() == new Date().getFullYear();
          })
          setTotalBookings(felteredBookings.length);
          setLoading(false);
          setBookings(felteredBookings);
        } else if (filterDate == "month") {
          let felteredBookings = response.data.filter((item) => {
            return new Date(item.check_in_date).getMonth() == new Date().getMonth();
          })
          setTotalBookings(felteredBookings.length);
          setLoading(false);
          setBookings(felteredBookings);
        }
      })
      .catch(error => {
        console.log(error);
        setError('Failed to load data');
      });

  }, [filterDate]);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Dashboard' />
      <main className='max-w-7xl mx-auto px-4 py-6 lg:px-8'>
        {error && <p>{error}</p>}
        <div>
          {loading ? <p>Loading...</p> : <>
            <form className='mb-8 '>
              <div className="mt-1 flex nowrap justify-between">
                <div>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <select onChange={(e) => { setFilterDate(e.target.value) }} className="self-end rounded-md w-1/4 border border-gray-600 bg-inherit focus:border-indigo-500 focus:ring-indigo-500 text-gray-200" >
                  <option value="all" className='bg-gray-800'>All time</option>
                  <option value="year" className='bg-gray-800'>For this year </option>
                  <option value="month" className='bg-gray-800'>For this month </option>
                  <option value="day" className='bg-gray-800'>For this day </option>
                </select>
              </div>
            </form>
            <motion.div
              className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <StatCard name="Total Income" value={`$${totalSales}`} icon={DollarSign} color="#6366f1" />
              <StatCard name="Expenses" value={`-$${totalExpenses}`} icon={DollarSign} color="red" />
              <StatCard name="Bookings" value={totalBookings} icon={Users} color="#34d399" />
              <StatCard name="Total Guests" value={totalGuests} icon={User} color="#34d399" />
              <StatCard name="Total Revenue" value={`$${totalRevenue}`} icon={Zap} color="#34d399" />
            </motion.div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <BookingChart bookings={bookings} />
              <PaymentChart payments={payments} />
              <ExpensePieChart expenses={expenses} />
            </div>
          </>
          }
        </div>
      </main>
    </div>
  )
}

export default Dashboard