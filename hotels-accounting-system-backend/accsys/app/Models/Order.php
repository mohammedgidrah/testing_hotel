<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'item_id',
        'booking_id',
        'quantity',
        'price_per_item',
        'total_price',
    ];

    protected static function booted()
    {
        static::creating(function ($order) {
            $order->total_price = $order->quantity * $order->price_per_item;
        });

        static::updating(function ($order) {
            $order->total_price = $order->quantity * $order->price_per_item;
        });
    }
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    // Add this accessor for easy image URL access
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
