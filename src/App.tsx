import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Sparkles, Zap } from 'lucide-react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { AuthModal } from './components/AuthModal';
import { OrderModal } from './components/OrderModal';
import { AdminPanel } from './components/AdminPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import type { Article, Client } from './types';

/* =========================
   CONSTANTES
========================= */

const CATEGORIES_FILTER = [
  'Tous','Robes','Costumes','T-Shirts','Jeans','Vestes',
  'Chaussures','Accessoires','Sous-vêtements','Sport','Enfants','Autre'
];

/* =========================
   TYPES
========================= */

type ModalType = null | 'auth' | 'admin' | 'article' | 'order' | 'notif';

/* =========================
   APP
========================= */

export function App() {
  const store = useStore();

  /* ===== STATES GLOBAUX ===== */

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  // 🔥 gestion centralisée des modals
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [orderArticle, setOrderArticle] = useState<Article | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  /* =========================
     FETCH INITIAL
  ========================= */

  useEffect(() => {
    if (store.fetchArticles) {
      store.fetchArticles();
    }
  }, []);

  /* =========================
     FILTERS
  ========================= */

  const publishedArticles = useMemo(
    () => store.articles.filter(a => a.published),
    [store.articles]
  );

  const filteredArticles = useMemo(() => {
    let filtered = publishedArticles;

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

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
    publishedArticles.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [publishedArticles]);

  /* =========================
     AUTH
  ========================= */

  const handleClientLogin = (phone: string, password: string) => {
    const client = store.loginClient(phone, password);
    if (client) {
      setCurrentClient(client);
      setActiveModal(null);
      return true;
    }
    return false;
  };

  const handleClientRegister = (data: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
  }) => {
    const client = store.registerClient(data);
    if (client) {
      setCurrentClient(client);
      setActiveModal(null);
      return true;
    }
    return false;
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (store.loginAdmin(username, password)) {
      setIsAdmin(true);
      setActiveModal('admin');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentClient(null);
    setActiveModal(null);
  };

  /* =========================
     ORDERS
  ========================= */

  const handleOrder = (article: Article) => {
    setOrderArticle(article);
    setActiveModal('order');
  };

  const handleOrderPlaced = (article: Article) => {
    if (currentClient) {
      store.addOrder({
        clientId: currentClient.id,
        clientName: `${currentClient.firstName} ${currentClient.lastName}`,
        clientPhone: currentClient.phone,
        articleId: article.id,
        articleName: article.name,
      });
    }
    setOrderArticle(null);
    setActiveModal(null);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* ===== BANNER ===== */}
      <div className="bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-cyan-900/80 border-b border-purple-500/20 overflow-hidden">
        <div className="flex items-center py-2">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            <span className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-cyan-300">Créé par</span>
              <span className="text-pink-400 font-extrabold">CHRISTIAN MBWETE</span>
              <span className="text-purple-300">(+243895180889)</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </span>
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <Header
        settings={store.settings}
        notifications={store.notifications}
        isAdmin={isAdmin}
        isClient={!!currentClient}
        clientName={currentClient ? `${currentClient.firstName} ${currentClient.lastName}` : undefined}
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        onNotificationsClick={() => setActiveModal('notif')}
        onLogout={handleLogout}
        onAdminPanel={() => setActiveModal('admin')}
        onLoginClick={() => setActiveModal('auth')}
      />

      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-10 lg:py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-purple-300/70 text-sm font-medium tracking-widest uppercase">
              Collection Disponible
            </span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>

          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4">
            {store.settings.name}
          </h2>

          <p className="text-purple-300/50 text-lg mb-6">
            {store.settings.slogan}
          </p>

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

      {/* ===== ARTICLES ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-purple-500/50 flex-shrink-0" />
          {CATEGORIES_FILTER.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#12121a] text-gray-500'
              }`}
            >
              {cat} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              settings={store.settings}
              onOrder={handleOrder}
              onView={(a) => {
                setSelectedArticle(a);
                setActiveModal('article');
              }}
            />
          ))}
        </div>
      </div>

      {/* =========================
         MODALS CENTRALISÉS
      ========================= */}

      {activeModal === 'auth' && (
        <AuthModal
          onClose={() => setActiveModal(null)}
          onClientLogin={handleClientLogin}
          onClientRegister={handleClientRegister}
          onAdminLogin={handleAdminLogin}
          onRecoverPassword={store.recoverPassword}
          onGetAdminCredentials={store.getAdminCredentials}
        />
      )}

      {activeModal === 'article' && selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          settings={store.settings}
          onClose={() => {
            setSelectedArticle(null);
            setActiveModal(null);
          }}
          onOrder={(article) => handleOrder(article)}
        />
      )}

      {activeModal === 'order' && orderArticle && (
        <OrderModal
          article={orderArticle}
          settings={store.settings}
          client={currentClient}
          onClose={() => {
            setOrderArticle(null);
            setActiveModal(null);
          }}
          onNeedLogin={() => setActiveModal('auth')}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {activeModal === 'admin' && isAdmin && (
        <AdminPanel
          articles={store.articles}
          settings={store.settings}
          clients={store.clients}
          orders={store.orders}
          onClose={() => setActiveModal(null)}
          onAddArticle={store.addArticle}
          onUpdateArticle={store.updateArticle}
          onDeleteArticle={store.deleteArticle}
          onPublishArticle={store.publishArticle}
          onUpdateSettings={store.updateSettings}
          onChangeAdminPassword={store.changeAdminPassword}
        />
      )}

      {activeModal === 'notif' && (
        <NotificationsPanel
          notifications={store.notifications}
          onClose={() => setActiveModal(null)}
          onMarkRead={store.markNotificationRead}
          onMarkAllRead={store.markAllNotificationsRead}
        />
      )}

    </div>
  );
}
