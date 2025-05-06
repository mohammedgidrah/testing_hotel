<?php
namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
        dd($request->all());
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'category'    => 'required|in:general,amenity,service,food',
            'status'      => 'required|in:isavailable,notavailable',
            'itemcategory' => 'required|array',
            'itemcategory.*.item_id' => 'required|exists:items,id',
            'image'       => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
    
        // Store the image in the 'public/images' directory
        $path = $request->file('image')->store('images', 'public');
        $validated['image'] = $path;
    
        // Create the item
        $item = Item::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price'       => $validated['price'],
            'category'    => $validated['category'],
            'status'      => $validated['status'],
            'image'       => $validated['image'],
        ]);
    
        // Optionally attach itemcategory relationships if there's a pivot table
        // $item->categories()->attach(collect($validated['itemcategory'])->pluck('item_id'));
    
        return response()->json([
            'item' => $item,
            'image_url' => asset("storage/$path"),
        ], 201);
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
