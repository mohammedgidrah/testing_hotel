<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Service::all();

        return response()->json($services);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
        ]);

        $service = Service::create($request->all());

        return response()->json($service, 201);
    }

    /**
     * Display the specified resource.
     */
    // public function show(string $id)
    // {
    //     $service = Service::find($id);
    //
    //     if (!$service) {
    //         return response()->json(['error' => 'Service not found'], 404);
    //     }
    //
    //     return response()->json($service, 200);
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
        ]);

        // Find service by id or fail
        $service = Service::findOrFail($id);

        // Update the service
        $service->update($request->all());

        return response()->json($service);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Find service by id or fail
        $service = Service::findOrFail($id);

        // Delete the service
        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }
}
