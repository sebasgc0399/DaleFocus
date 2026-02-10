import { getAuth } from 'firebase-admin/auth';

const AUTH_HEADER_PREFIX = 'Bearer ';

function getBearerToken(req) {
  const authHeader = req.get('Authorization') || '';
  if (!authHeader.startsWith(AUTH_HEADER_PREFIX)) {
    return null;
  }

  const token = authHeader.slice(AUTH_HEADER_PREFIX.length).trim();
  return token || null;
}

export async function requireUserAuth(req, res, expectedUserId) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'No autorizado: falta token Bearer' });
    return null;
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    if (expectedUserId && decodedToken.uid !== expectedUserId) {
      res.status(403).json({ error: 'No autorizado: userId no coincide con el token' });
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error('Token de Firebase invalido:', error);
    res.status(401).json({ error: 'No autorizado: token invalido o expirado' });
    return null;
  }
}
