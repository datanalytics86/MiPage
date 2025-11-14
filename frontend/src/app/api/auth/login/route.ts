import { NextResponse } from 'next/server';

import { demoUsers, sanitizeDemoUser } from '../_utils/demoData';

const DEMO_EXPIRY_MS = 1000 * 60 * 60 * 4; // 4 horas

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string | undefined = body?.email;
    const password: string | undefined = body?.password;
    const role: string | undefined = body?.role;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, contraseña y rol son obligatorios.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.toUpperCase();

    const user = demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.role === normalizedRole &&
        candidate.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifica tu usuario, contraseña y tipo de sesión.' },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Tu cuenta está inactiva. Contacta al administrador para más detalles.' },
        { status: 403 }
      );
    }

    if (user.emailConfirmed === false) {
      return NextResponse.json(
        {
          error: 'Debes confirmar tu correo antes de ingresar.',
          requiresConfirmation: true,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      user: sanitizeDemoUser(user),
      token: `demo-token-${user.id}`,
      expiresInMs: DEMO_EXPIRY_MS,
    });
  } catch (error) {
    console.error('Error en demo login handler', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el inicio de sesión.' },
      { status: 500 }
    );
  }
}
