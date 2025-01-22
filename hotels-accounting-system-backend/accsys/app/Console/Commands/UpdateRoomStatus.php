<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;

class UpdateRoomStatus extends Command
{
    protected $signature = 'rooms:update-status';
    protected $description = 'Update room status based on check-out dates';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $bookings = Booking::where('check_out_date', '<', Carbon::today())
                            ->get();
        foreach ($bookings as $booking) {
            $room = Room::find($booking->room_id);
            if ($room->status == 'occupied') {
                $room->update(['status' => 'available']);
            }
        }
        $this->info('Room statuses updated successfully.');
    }
}