import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { ArticleCard } from '../components/ArticleCard';
import { NotificationsPanel } from '../components/NotificationsPanel';
import type { Article, Notification, BoutiqueSettings } from '../types';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const settings: BoutiqueSettings = {
    currencyFC: 'FC',
    currencyUSD: 'USD',
  };

  // Fetch articles
  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*');
    setArticles(data || []);
  };

  // Fetch notifications in real-time
  useEffect(() => {
    fetchArticles();

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
        toast.success(payload.new.message);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleOrder = async (article: Article) => {
    // Ici tu peux créer l'appel API pour enregistrer la commande
    toast.success(`Commande pour ${article.name} enregistrée !`);
  };

  const handleView = (article: Article) => {
    toast(`Voir détails de ${article.name}`);
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setShowNotif(true)}
        className="fixed top-5 right-5 bg-purple-600 text-white px-4 py-2 rounded-xl"
      >
        Notifications ({notifications.filter(n => !n.read).length})
      </button>

      {showNotif && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotif(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />
      )}

      <h1 className="text-2xl font-bold mb-4 text-white">Articles</h1>
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
    </div>
  );
}
