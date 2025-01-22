<?php



namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with('booking')->get();
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $payment = Payment::create($request->all());
        return response()->json($payment);
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

