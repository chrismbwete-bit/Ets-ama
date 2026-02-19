import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { client_id, article_id, quantity } = req.body;

  const { data, error } = await supabase
    .from('orders')
    .insert({ client_id, article_id, quantity })
    .select();

  if (error) return res.status(500).json({ error });

  res.status(200).json({ message: 'Commande créée !', order: data[0] });
}
