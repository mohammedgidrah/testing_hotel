<?php
namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $orders = Order::with(['item', 'booking'])->get();

            return response()->json([
                'status' => 'success',
                'data'   => $orders,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error fetching orders: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_id'    => 'required|exists:items,id',
            'booking_id' => 'required|exists:bookings,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()->all(),
            ], 422);
        }

        try {
            // Get price from items table
            $item = Item::findOrFail($request->item_id);

            $orderData = [
                'item_id'        => $request->item_id,
                'booking_id'     => $request->booking_id,
                'quantity'       => $request->quantity,
                'price_per_item' => $item->price,  

                'total_price'    => $item->price * $request->quantity,
            ];

            $order = Order::create($orderData);

            return response()->json([
                'status'  => 'success',
                'message' => 'Order created successfully',
                'data'    => $order->load(['item', 'booking']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error creating order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified order.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $order = Order::with(['item', 'booking'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data'   => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Order not found',
            ], 404);
        }
    }

    /**
     * Update the specified order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'item_id'    => 'required|exists:items,id',
            'booking_id' => 'required|exists:bookings,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()->all(),
            ], 422);
        }

        try {
            $order = Order::findOrFail($id);
            $item  = Item::findOrFail($request->item_id);

            $orderData = [
                'item_id'        => $request->item_id,
                'booking_id'     => $request->booking_id,
                'quantity'       => $request->quantity,
                'price_per_item' => $item->price, // Get fresh price from item
                'total_price'    => $item->price * $request->quantity,
            ];

            $order->update($orderData);

            return response()->json([
                'status'  => 'success',
                'message' => 'Order updated successfully',
                'data'    => $order->load(['item', 'booking']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error updating order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified order from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $order = Order::findOrFail($id);

            $order->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Order deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error deleting order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
