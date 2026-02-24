import { authenticateRequest } from '@/lib/middleware';

export async function GET(request) {
  try {
    const { authenticated, user, error } = authenticateRequest(request);

    if (!authenticated) {
      return Response.json(
        { error: error },
        { status: 401 }
      );
    }

    return Response.json(
      {
        message: 'Token valid',
        user: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
