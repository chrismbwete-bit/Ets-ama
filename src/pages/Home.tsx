import { useEffect, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import ArticleCard from '../components/ArticleCard';
import { NotificationsPanel } from '../components/NotificationsPanel';
import type { Article, Notification, BoutiqueSettings } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<BoutiqueSettings>({
    currencyFC: 'FC',
    currencyUSD: 'USD',
  });
  const [showNotifications, setShowNotifications] = useState(false);

  // Vérifie la session utilisateur et fetch articles + notifications
  useEffect(() => {
    const init = async () => {
      // Session utilisateur
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) setUser(data.session.user);

      // Récupérer les articles
      const { data: articlesData } = await supabase.from('articles').select('*');
      setArticles(articlesData ?? []);

      // Notifications existantes
      const { data: notifData } = await supabase.from('notifications').select('*').order('createdAt', { ascending: false });
      setNotifications(notifData ?? []);
    };

    init();

    // Subscription pour les notifications en temps réel
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
        toast.success(payload.new.message);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const handleOrder = async (article: Article) => {
    if (!user) {
      toast.error('Vous devez être connecté pour commander.');
      return;
    }
    try {
      await supabase.from('orders').insert({
        articleId: article.id,
        userId: user.id,
        quantity: 1,
        createdAt: new Date().toISOString(),
      });
      toast.success(`Commande pour "${article.name}" passée !`);
    } catch (err) {
      toast.error('Erreur lors de la commande.');
    }
  };

  const handleView = (article: Article) => {
    toast(`Vous consultez : ${article.name}`);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <button onClick={() => setShowNotifications(true)} className="btn-neon-purple px-4 py-2 rounded-xl">
          Notifications ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {articles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            settings={settings}
            onOrder={handleOrder}
            onView={handleView}
          />
        ))}
      </div>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
}
