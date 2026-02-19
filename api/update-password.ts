import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: { method: string; body: any }, res: { status: (code: number) => { json: (data: any) => void } }) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { userId, newPassword } = req.body;

  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
