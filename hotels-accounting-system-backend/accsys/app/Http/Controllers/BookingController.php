<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Service;
use DB;
use Illuminate\Http\Request;
use Validator;

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

// app/Http/Controllers/BookingController.php
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'guest_id'       => 'required|exists:guests,id',
            'room_id'        => 'required|exists:rooms,id',
            'check_in_date'  => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'email'          => 'nullable|email',
            'phone_number'   => 'nullable|string',
            'payment_status' => 'required|in:pending,paid',
            'total_amount'   => 'required|numeric',
            'services'       => 'nullable|array',     // Array of service IDs
            'services.*'     => 'exists:services,id', // Validate each service ID
        ]);

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Create the booking
            $booking = Booking::create([
                'guest_id'       => $request->guest_id,
                'room_id'        => $request->room_id,
                'check_in_date'  => $request->check_in_date,
                'check_out_date' => $request->check_out_date,
                'email'          => $request->email,
                'phone_number'   => $request->phone_number,
                'payment_status' => $request->payment_status,
                'total_amount'   => $request->total_amount,
            ]);

            // Attach selected services to the booking with their prices
            if ($request->has('services') && ! empty($request->services)) {
                $servicesWithPrices = [];
                foreach ($request->services as $serviceId) {
                    // Fetch the service to get its price
                    $service                        = Service::findOrFail($serviceId);
                    $servicesWithPrices[$serviceId] = ['price' => $service->price];
                }

                // Attach services with their prices to the booking
                $booking->services()->attach($servicesWithPrices);
            }

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking,
            ], 201);
        } catch (\Exception $e) {
            // Rollback the transaction on error
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create booking',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show($roomId)
    {
        $bookings = Booking::where('room_id', $roomId)->get(['check_in_date', 'check_out_date']);
        return response()->json([
            'bookings' => $bookings,
        ]);
    }
    public function update(Request $request, $id)
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'room_id'        => 'required|exists:rooms,id', // Ensure room_id is provided
            'booking_id'     => 'required|exists:bookings,id',
            'payment_status' => 'required|in:pending,paid',
            'check_in_date'  => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update($request->all());
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
    // app/Http/Controllers/BookingController.php
    public function getServices($id)
    {
        $booking  = Booking::findOrFail($id);
        $services = $booking->services;
        return response()->json($services);
    }
}
