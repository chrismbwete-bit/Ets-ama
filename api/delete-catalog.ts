import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: { method: string; body: any }, res: { status: (code: number) => { json: (data: any) => void } }) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { articleId } = req.body;

  try {
    const { error } = await supabase.from('articles').delete().eq('id', articleId);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Article supprimé' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
