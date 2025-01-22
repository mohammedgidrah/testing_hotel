<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;


class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        // Add the user role to the token payload
        $customClaims = ['role' => $user->role];
        $token = JWTAuth::claims($customClaims)->attempt($credentials);

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }

    public function logout()
    {
        // Specify 'api' guard
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => 3600 * 9, // Set expiration as needed
        ]);
    }
}

