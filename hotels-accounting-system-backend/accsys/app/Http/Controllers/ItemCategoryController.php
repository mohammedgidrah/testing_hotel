<?php
namespace App\Http\Controllers;

use App\Models\ItemCategory;
use Illuminate\Http\Request;

class ItemCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = ItemCategory::withCount('items')->get();
        return response()->json($items);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json(['message' => 'Not implemented. Use API documentation to understand usage.'], 501);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $item = ItemCategory::create($validated);

        return response()->json(['message' => 'Item category created successfully.', 'data' => $item], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ItemCategory $itemCategory)
    {
        return response()->json($itemCategory);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ItemCategory $itemCategory)
    {
        return response()->json(['message' => 'Not implemented. Use API documentation to understand usage.'], 501);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ItemCategory $itemCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $itemCategory->update($validated);

        return response()->json(['message' => 'Item category updated successfully.', 'data' => $itemCategory]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemCategory $itemCategory)
    {
        $itemCategory->delete();

        return response()->json(['message' => 'Item category deleted successfully.']);
    }
}
