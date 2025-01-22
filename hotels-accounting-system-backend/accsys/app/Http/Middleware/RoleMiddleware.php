<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;

class RoleMiddleware
{
    public function handle($request, Closure $next, ...$roles)
    {
        // Parse the token
        $user = JWTAuth::parseToken()->authenticate();

        // Check if the user's role is allowed
        if (!in_array($user->role, $roles)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
