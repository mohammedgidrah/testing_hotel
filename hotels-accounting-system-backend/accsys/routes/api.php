<?php

use Illuminate\Http\Request;
use App\Models\Guest;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\{
    UserController,
    GuestController,
    RoomController,
    BookingController,
    ExpenseController,
    PaymentController,
    FinancialReportController,
    LoginController,
    ServiceController,
    ItemController,
    OrderController,
    ItemCategoryController

};

Route::get('/guests/{id}', function ($id) {
    $guest = Guest::find($id); // Find the guest by ID

    if ($guest) {
        return response()->json([
            'email' => $guest->email,
            'phone_number' => $guest->phone_number,
        ]);
    } else {
        return response()->json(['message' => 'Guest not found'], 404);
    }
});

// API Login
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:api');

// Shared API Routes for All Authenticated Users with Specific Roles
Route::middleware(['auth:api'])->group(function () {
    
    // Shared Routes for Admin, Manager, and Accountant
    Route::apiResource('guests', GuestController::class); // View
    Route::apiResource('rooms', RoomController::class);   // Add, delete, change status
    Route::apiResource('bookings', BookingController::class); // Delete, Update
    Route::get('/expenses', [ExpenseController::class, 'index']); // Add this line for GET requests
    Route::post('/expenses', [ExpenseController::class, 'store']); // Existing POST route
    Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('orders', OrderController::class);
    Route::prefix('bookingsQuery')->group(function () {
        Route::get('today', [BookingController::class, 'getBookingsToday']);
    });
    Route::group(['middleware' => 'auth:sanctum'], function() {
        Route::get('/items', [ItemController::class, 'index']);
        Route::get('/item-categories', [ItemController::class, 'categories']);
    });
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy']);
    Route::apiResource('item-categories', ItemCategoryController::class);
Route::apiResource('items', ItemController::class);
 Route::get('/bookings/{id}/services', [BookingController::class, 'getServices']);



    // Route for generating financial report
    Route::get('/financial-report', [FinancialReportController::class, 'generateReport']);
    
    // Role-Specific Routes
    Route::middleware('role:admin')->group(function () {
        
        Route::apiResource('financial-reports', FinancialReportController::class); // CRUD
    });

    Route::middleware('role:manager')->group(function () {
        
        Route::apiResource('financial-reports', FinancialReportController::class); // CRUD for Manager
    });
});


// API for Translations
Route::get('/translations/{lang}', function ($lang) {
    $translations = [
        'ar' => [
            'welcome' => 'مرحبًا',
            'logout' => 'تسجيل الخروج',
        ],
        'en' => [
            'welcome' => 'Welcome',
            'logout' => 'Logout',
        ],
    ];

    return response()->json($translations[$lang] ?? []);
});