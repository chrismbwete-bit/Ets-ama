import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Zap, Sparkles } from 'lucide-react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { AuthModal } from './components/AuthModal';
import { OrderModal } from './components/OrderModal';
import { AdminPanel } from './components/AdminPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import type { Article, Client } from '../types';

const CATEGORIES_FILTER = [
  'Tous', 'Robes', 'Costumes', 'T-Shirts', 'Jeans', 'Vestes', 'Chaussures',
  'Accessoires', 'Sous-vêtements', 'Sport', 'Enfants', 'Autre'
];

export function App() {
  const store = useStore();

  // --- STATES ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [orderArticle, setOrderArticle] = useState<Article | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const publishedArticles = useMemo(() => store.articles.filter(a => a.published), [store.articles]);

  const filteredArticles = useMemo(() => {
    let filtered = publishedArticles;
    if (selectedCategory !== 'Tous') filtered = filtered.filter(a => a.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [publishedArticles, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: publishedArticles.length };
    publishedArticles.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return counts;
  }, [publishedArticles]);

  // --- AUTH HANDLERS ---
  const handleClientLogin = (phone: string, password: string) => {
    const client = store.loginClient(phone, password);
    if (client) { setCurrentClient(client); setShowAuth(false); return true; }
    return false;
  };

  const handleClientRegister = (data: { firstName: string; lastName: string; phone: string; password: string }) => {
    const client = store.registerClient(data);
    if (client) { setCurrentClient(client); setShowAuth(false); return true; }
    return false;
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (store.loginAdmin(username, password)) { setIsAdmin(true); setShowAuth(false); setShowAdmin(true); return true; }
    return false;
  };

  const handleRecoverPassword = (phone: string): string | null => store.recoverPassword(phone);

  const handleLogout = () => { setIsAdmin(false); setCurrentClient(null); setShowAdmin(false); };

  // --- ORDER HANDLERS SAFE ---
  const handleOrder = (article: Article) => {
    // On ferme le détail d’article avant d’ouvrir la modal de commande
    setSelectedArticle(null);
    setTimeout(() => setOrderArticle(article), 50); // ✅ Séparation des updates state
  };

  const handleOrderPlaced = (article: Article) => {
    if (currentClient) {
      store.addOrder({
        clientId: currentClient.id,
        clientName: `${currentClient.firstName} ${currentClient.lastName}`,
        clientPhone: currentClient.phone,
        articleId: article.id,
        articleName: article.name
      });
    }
    setOrderArticle(null);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* HEADER */}
      <Header
        settings={store.settings}
        notifications={store.notifications}
        isAdmin={isAdmin}
        isClient={!!currentClient}
        clientName={currentClient ? `${currentClient.firstName} ${currentClient.lastName}` : undefined}
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        onNotificationsClick={() => setShowNotifications(true)}
        onLogout={handleLogout}
        onAdminPanel={() => setShowAdmin(true)}
        onLoginClick={() => setShowAuth(true)}
      />

      {/* HERO */}
      <div className="relative overflow-hidden py-10">
        <h1 className="text-3xl lg:text-5xl font-extrabold text-center text-purple-300">
          {store.settings.name}
        </h1>
        <p className="text-center text-purple-400">{store.settings.slogan}</p>

        <div className="relative max-w-lg mx-auto mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-12 pr-12 py-4 bg-[#12121a] border border-purple-500/20 text-white rounded-2xl outline-none"
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto px-4 scrollbar-hide">
        <Filter className="w-5 h-5 text-purple-500/50 flex-shrink-0" />
        {CATEGORIES_FILTER.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-[#12121a] text-gray-500'
            }`}
          >
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      {/* ARTICLES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-4">
        {filteredArticles.map(article => (
          <ArticleCard
            key={article.id} // ✅ Clé stable
            article={article}
            settings={store.settings}
            onOrder={handleOrder}
            onView={setSelectedArticle}
          />
        ))}
      </div>

      {/* ===== MODALS ===== */}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onClientLogin={handleClientLogin}
          onClientRegister={handleClientRegister}
          onAdminLogin={handleAdminLogin}
          onRecoverPassword={handleRecoverPassword}
          onGetAdminCredentials={store.getAdminCredentials}
        />
      )}

      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          settings={store.settings}
          onClose={() => setSelectedArticle(null)}
          onOrder={handleOrder}
        />
      )}

      {orderArticle && (
        <OrderModal
          article={orderArticle}
          settings={store.settings}
          client={currentClient}
          onClose={() => setOrderArticle(null)}
          onNeedLogin={() => setShowAuth(true)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {showAdmin && isAdmin && (
        <AdminPanel
          articles={store.articles}
          settings={store.settings}
          clients={store.clients}
          orders={store.orders}
          onClose={() => setShowAdmin(false)}
          onAddArticle={store.addArticle}
          onUpdateArticle={store.updateArticle}
          onDeleteArticle={store.deleteArticle}
          onPublishArticle={store.publishArticle}
          onUpdateSettings={store.updateSettings}
          onChangeAdminPassword={store.changeAdminPassword}
        />
      )}

      {showNotifications && (
        <NotificationsPanel
          notifications={store.notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={store.markNotificationRead}
          onMarkAllRead={store.markAllNotificationsRead}
        />
      )}

    </div>
  );
}
