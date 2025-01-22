<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_name',
        'total_income',
        'total_expenses',
        'net_profit',
        'report_period',
        'created_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
