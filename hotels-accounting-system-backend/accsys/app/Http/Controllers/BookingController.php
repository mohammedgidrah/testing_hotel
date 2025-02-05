<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api'); // Ensure authentication middleware is used
    }

    public function index()
    {
        $bookings = Booking::with('guest', 'room')->get();
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        try {
            $booking = Booking::create($request->all());
            return response()->json(['message' => 'Booking successful', 'booking' => $booking]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($roomId)
    {
        $bookings = Booking::where('room_id', $roomId)->get(['check_in_date', 'check_out_date']);
        return response()->json([
            'bookings' => $bookings
        ]);
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

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $room    = Room::findOrFail($booking->room_id);
        $room->update(['status' => 'available']);
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
    public function getBookingsToday()
    {

        $today    = date('Y-m-d');
        $bookings = Booking::whereDate('check_in_date', $today)->get();

        if ($bookings->isEmpty()) {

            return response()->json([
                'message' => 'No bookings found for today',
                'data'    => [$today],
            ], 200);
        }
        return response()->json($bookings);
    }
}
