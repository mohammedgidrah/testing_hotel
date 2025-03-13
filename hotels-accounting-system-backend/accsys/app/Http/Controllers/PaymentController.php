<?php



namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class PaymentController extends Controller
{
    // public function index()
    // {
    //     $payments = Payment::with('booking')->get();
    //     return response()->json($payments);
    // }
    public function index()
    {
        $payments = Payment::with(['booking', 'booking.guest', 'booking.room'])
            ->orderBy('payment_date', 'desc')
            ->get();
            
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,credit_card',
            'payment_date' => 'required|date'
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
    
        try {
            // Use a transaction for atomicity
            DB::transaction(function () use ($request) {
                // Update booking status
                $booking = Booking::findOrFail($request->booking_id);
                $booking->payment_status = 'paid';
                $booking->save();
    
                // Create payment
                Payment::create([
                    'booking_id' => $request->booking_id,
                    'amount_paid' => $request->amount_paid,
                    'payment_method' => $request->payment_method,
                    'payment_date' => $request->payment_date
                ]);
            });
    
            return response()->json([
                'message' => 'Payment processed successfully',
                'payment' => Payment::with('booking')->latest()->first()
            ], 201);
    
        } catch (\Exception $e) {
            Log::error("Payment processing failed: " . $e->getMessage());
            return response()->json([
                'message' => 'Payment processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    
    

    public function show($id)
    {
        $payment = Payment::with('booking')->findOrFail($id);
        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update($request->all());
        return response()->json($payment);
    }

    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->json(['message' => 'Payment deleted successfully']);
    }
}