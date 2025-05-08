<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;
    // protected $garded = [];

    protected $fillable = [
        'name',
        'price',
        'category_id',
        'status',
        'description',
        'image'  
    ];
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }
 

}
