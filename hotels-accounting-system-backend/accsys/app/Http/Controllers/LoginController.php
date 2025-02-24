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
        // Validate the incoming request data
        $credentials = $request->only('email', 'password');

        // Attempt to log the user in and get the token
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the authenticated user
        $user = Auth::user();

        // Add custom claims (name and role) to the token
        $customClaims = [
            'name' => $user->name,
            'role' => $user->role,
        ];

        // Generate the token with custom claims
        $token = JWTAuth::claims($customClaims)->attempt($credentials);

        // Return the response with the generated token
        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }

    public function logout()
    {
        // Specify 'api' guard to logout the user
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
