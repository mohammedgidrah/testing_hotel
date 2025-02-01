<?php



namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Room;

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
        $validated = $request->validate([
            'guest_id' => 'required|exists:guests,id',
            'room_id' => 'required|exists:rooms,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date',
            'email' => 'required|email',
            'phone_number' => 'required|string',
            'payment_status' => 'required|in:Pending,Completed',
            'total_amount' => 'required|numeric|min:0',
        ]);
    
        // Create a new booking
        $booking = Booking::create([
            'guest_id' => $validated['guest_id'],
            'room_id' => $validated['room_id'],
            'check_in_date' => $validated['check_in_date'],
            'check_out_date' => $validated['check_out_date'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'payment_status' => $validated['payment_status'],
            'total_amount' => $validated['total_amount'],
        ]);
    
        // Update the room status
        $room = Room::findOrFail($validated['room_id']);
        $room->update(['status' => 'occupied']);
        $room->save();
    
        return response()->json($booking, 201);
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

