const USERS = [
  { email: 'info@endodontielouise.be', password: '123Louise!456' },
  { email: 'endoajaccio@gmail.com', password: '123Ajaccio!456' },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const token = Buffer.from(`${user.email}:${secret}`).toString('base64');

  res.status(200).json({ token, email: user.email });
}
