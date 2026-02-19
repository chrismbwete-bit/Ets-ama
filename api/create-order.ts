import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express'; // pas besoin de @vercel/node

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { articleId, userId, quantity } = req.body;

  try {
    const { data, error } = await supabase.from('orders').insert({
      article_id: articleId,
      user_id: userId,
      quantity,
      status: 'pending',
      created_at: new Date()
    });

    if (error) throw error;

    res.status(200).json({ success: true, order: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
