import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, Zap, Sparkles } from 'lucide-react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { AuthModal } from './components/AuthModal';
import { OrderModal } from './components/OrderModal';
import { AdminPanel } from './components/AdminPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import type { Article, Client } from './types';

const CATEGORIES_FILTER = ['Tous', 'Robes', 'Costumes', 'T-Shirts', 'Jeans', 'Vestes', 'Chaussures', 'Accessoires', 'Sous-vêtements', 'Sport', 'Enfants', 'Autre'];

export function App() {
  const store = useStore();

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

  // --- FETCH ARTICLES ---
  useEffect(() => {
    store.fetchArticles();
  }, [store]);

  // --- FILTERS ---
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

  // --- HANDLERS ---
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

  const handleOrder = (article: Article) => { setOrderArticle(article); };

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

  // --- PORTALS FOR MODALS ---
  const ModalPortal = ({ children }: { children: React.ReactNode }) =>
    createPortal(children, document.body);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* ===== SCROLLING MARQUEE ===== */}
      <div className="bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-cyan-900/80 border-b border-purple-500/20 overflow-hidden">
        <div className="flex items-center py-2">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            <span className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-cyan-300">Créé par CHRISTIAN MBWETE</span>
              <span className="text-purple-300">(+243895180889)</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </span>
          </div>
        </div>
      </div>

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

      {/* HERO + SEARCH */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 lg:py-16 text-center max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400 neon-flicker" />
            <span className="text-purple-300/70 text-sm font-medium tracking-widest uppercase">Collection Disponible</span>
            <Sparkles className="w-5 h-5 text-yellow-400 neon-flicker" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight shimmer-text">
            {store.settings.name}
          </h2>
          <p className="text-purple-300/50 text-lg mb-6">{store.settings.slogan}</p>

          <div className="relative max-w-lg mx-auto">
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
      </div>

      {/* CATEGORIES */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              settings={store.settings}
              onOrder={handleOrder}
              onView={setSelectedArticle}
            />
          ))}
        </div>
      </div>

      {/* MODALS VIA PORTAL */}
      {showAuth && (
        <ModalPortal>
          <AuthModal
            onClose={() => setShowAuth(false)}
            onClientLogin={handleClientLogin}
            onClientRegister={handleClientRegister}
            onAdminLogin={handleAdminLogin}
            onRecoverPassword={handleRecoverPassword}
            onGetAdminCredentials={store.getAdminCredentials}
          />
        </ModalPortal>
      )}

      {selectedArticle && (
        <ModalPortal>
          <ArticleDetail
            key={selectedArticle.id}
            article={selectedArticle}
            settings={store.settings}
            onClose={() => setSelectedArticle(null)}
            onOrder={(article) => { setSelectedArticle(null); handleOrder(article); }}
          />
        </ModalPortal>
      )}

      {orderArticle && (
        <ModalPortal>
          <OrderModal
            key={orderArticle.id}
            article={orderArticle}
            settings={store.settings}
            client={currentClient}
            onClose={() => setOrderArticle(null)}
            onNeedLogin={() => setShowAuth(true)}
            onOrderPlaced={handleOrderPlaced}
          />
        </ModalPortal>
      )}

      {showAdmin && isAdmin && (
        <ModalPortal>
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
        </ModalPortal>
      )}

      {showNotifications && (
        <ModalPortal>
          <NotificationsPanel
            notifications={store.notifications}
            onClose={() => setShowNotifications(false)}
            onMarkRead={store.markNotificationRead}
            onMarkAllRead={store.markAllNotificationsRead}
          />
        </ModalPortal>
      )}
    </div>
  );
}
