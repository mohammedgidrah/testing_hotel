<?php

// app/Models/Booking.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'guest_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'total_amount',
        'payment_status',
    ];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'booking_id');   
    }
    // app/Models/Booking.php
public function services()
{
    return $this->belongsToMany(Service::class, 'booking_service');
}
public function orders()
{
    return $this->hasMany(Order::class);
}

}

