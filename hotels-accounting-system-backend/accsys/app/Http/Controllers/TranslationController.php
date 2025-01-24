<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\App;

class TranslationController extends Controller
{
    public function index($locale)
    {
        App::setLocale($locale);
        return response()->json([
            'translations' => trans('messages'),
        ]);
    }
}
