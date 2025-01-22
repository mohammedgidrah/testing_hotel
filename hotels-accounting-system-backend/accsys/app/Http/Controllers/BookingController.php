<?php



namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Room;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('guest', 'room')->get();
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $booking = Booking::create($request->all());
        return response()->json($booking);
    }

    public function show($id)
    {
        $booking = Booking::with('guest', 'room')->findOrFail($id);
        return response()->json($booking);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update($request->all());

        $payment = Payment::where('booking_id', $id)->first();
        if ($payment) {
            $payment->update([
                'amount_paid' => $request->input('total_amount'),
            ]);
        }

        $room = Room::findOrFail($request->room_id);
        $room->update(['status' => 'occupied']);
        return response()->json($booking);
    }


    public function destroy( $id)
    {
        $booking = Booking::findOrFail($id);
        $room = Room::findOrFail($booking->room_id);
        $room->update(['status' => 'available']);
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
    public function getBookingsToday()
    {
       
        $today = date('Y-m-d');
        $bookings = Booking::whereDate('check_in_date', $today)->get();
        if ($bookings->isEmpty()) {
            return response()->json([
                'message' => 'No bookings found for today',
                'data' => [],
            ], 200);
        }
        return response()->json($bookings);
    }
}

