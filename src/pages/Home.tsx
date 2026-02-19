import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import ArticleCard from '../components/ArticleCard';
import { NotificationsPanel } from '../components/NotificationsPanel';
import type { Notification } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface User {
  id: string;
  email?: string;
  phone?: string;
}

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // ⚡ Persistance de session et écoute des notifications
  useEffect(() => {
    // Vérifie la session existante
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user as User);
    });

    // Écoute les changements de session
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User ?? null);
    });

    // Écoute les notifications en temps réel
    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        payload => {
          setNotifications(prev => [payload.new, ...prev]);
          toast.success(payload.new.message);
        }
      )
      .subscribe();

    fetchArticles();

    return () => {
      listener.subscription.unsubscribe();
      supabase.removeChannel(subscription);
    };
  }, []);

  // Récupère les articles
  const fetchArticles = async () => {
    const { data, error } = await supabase.from('articles').select('*');
    if (error) return toast.error('Erreur chargement articles');
    setArticles(data);
  };

  // Passer une commande
  const handleOrder = async (articleId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour commander.');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .insert([{ article_id: articleId, user_id: user.id }]);

    if (error) {
      toast.error('Erreur lors de la commande.');
    } else {
      toast.success('Commande passée avec succès !');
    }
  };

  // Marquer notification lue
  const markRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  // Tout lire
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true });
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={() => setShowNotifications(true)}
        >
          Notifications ({notifications.filter(n => !n.read).length})
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {articles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onOrder={() => handleOrder(article.id)}
          />
        ))}
      </div>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />
      )}
    </div>
  );
}
