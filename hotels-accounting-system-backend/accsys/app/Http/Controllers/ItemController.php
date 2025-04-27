<?php
namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $items = Item::all(); // Remove pagination if not needed
            return response()->json([
                'success' => true,
                'data'    => $items,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve items',
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'category'    => 'required|in:general,amenity,service,food',
            'status'      => 'required|in:isavailable,notavailable',
            'image'       => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        // Store the image in the 'public/images' directory
        $path = $request->file('image')->store('images', 'public');

        // Save the image path to the validated data
        $validated['image'] = $path;

        // Create the item
        $item = Item::create($validated);

        return response()->json([
            'item' => $item,
            'url'  => asset("storage/$path"),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $item)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Item retrieved successfully',
                'data'    => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve item',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Item $item)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'category'    => 'sometimes|in:general,amenity,service,food',
            'status'      => 'sometimes|in:isavailable,notavailable',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
    
 
    
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }
    
        try {
            // Handle image update
            if ($request->hasFile('image')) {
                // Delete old image
                if ($item->image) {
                    Storage::delete($item->image);
                }
                
                // Store new image
                $path = $request->file('image')->store('images', 'public');
                $item->image = $path;
            }
    
            // Update other fields
            $item->update($request->except('image'));
    
            return response()->json([
                'success' => true,
                'message' => 'Item updated successfully',
                'data'    => $item,
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update item',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        try {
            if ($item->delete()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Item deleted successfully',
                ], 204);
            }
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete item',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete item',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
