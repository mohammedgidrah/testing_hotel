<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
    ];

    // Relationship with bookings
    public function bookings()
    {
        return $this->belongsToMany(Booking::class)
            ->withPivot('price')
            ->withTimestamps();
    }
}