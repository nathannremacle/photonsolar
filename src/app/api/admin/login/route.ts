import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/admin-auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limiter';

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`admin-login-${clientIP}`);

    if (!rateLimit.allowed) {
      const minutesLeft = Math.ceil((rateLimit.resetAt - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { 
          error: `Trop de tentatives. Veuillez réessayer dans ${minutesLeft} minute(s).`,
          rateLimited: true,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Verify password
    if (verifyPassword(password)) {
      // Reset rate limit on successful login
      resetRateLimit(`admin-login-${clientIP}`);
      
      return NextResponse.json({ 
        success: true,
        remainingAttempts: rateLimit.remaining,
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Mot de passe incorrect',
          remainingAttempts: rateLimit.remaining,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}

