const VALID_EMAILS = ['info@endodontielouise.be', 'endoajaccio@gmail.com'];

export function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;

  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, secret] = decoded.split(':');
    const expectedSecret = process.env.AUTH_SECRET || 'dev-secret';
    return VALID_EMAILS.includes(email) && secret === expectedSecret;
  } catch {
    return false;
  }
}
