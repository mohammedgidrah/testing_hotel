<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    // protected $fillable = [
    //     'booking_id',
    //     'payment_method',
    //     'amount_paid',
    //     'payment_date',
    // ];
    protected $fillable = [
        'booking_id',
        'amount_paid',
        'payment_method',
        'payment_date',
        'created_at',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}

