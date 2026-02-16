import { useState, useMemo } from 'react';
import { Search, Filter, X, MapPin, Phone, ShoppingBag, Sparkles, Zap } from 'lucide-react';
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

  const publishedArticles = useMemo(() => store.articles.filter(a => a.published), [store.articles]);

  const filteredArticles = useMemo(() => {
    let filtered = publishedArticles;
    if (selectedCategory !== 'Tous') filtered = filtered.filter(a => a.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
    }
    return filtered;
  }, [publishedArticles, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: publishedArticles.length };
    publishedArticles.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return counts;
  }, [publishedArticles]);

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
      store.addOrder({ clientId: currentClient.id, clientName: `${currentClient.firstName} ${currentClient.lastName}`, clientPhone: currentClient.phone, articleId: article.id, articleName: article.name });
    }
    setOrderArticle(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ===== SCROLLING MARQUEE BANNER ===== */}
      <div className="bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-cyan-900/80 border-b border-purple-500/20 overflow-hidden">
        <div className="flex items-center py-2">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            <span className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">✨</span>
              <span className="text-cyan-300">Créé par l'informaticien</span>
              <span className="text-pink-400 font-extrabold text-glow-pink">CHRISTIAN MBWETE</span>
              <span className="text-purple-300">(+243895180889)</span>
              <span className="text-yellow-400">✨</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </span>
            <span className="text-sm font-bold flex items-center gap-2">
              <span className="text-green-400">💻</span>
              <span className="text-cyan-300">Développeur d'applications</span>
              <span className="text-purple-400">•</span>
              <span className="text-pink-300">Solutions digitales sur mesure</span>
              <span className="text-green-400">💻</span>
            </span>
            <span className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">✨</span>
              <span className="text-cyan-300">Créé par l'informaticien</span>
              <span className="text-pink-400 font-extrabold text-glow-pink">CHRISTIAN MBWETE</span>
              <span className="text-purple-300">(+243895180889)</span>
              <span className="text-yellow-400">✨</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </span>
            <span className="text-sm font-bold flex items-center gap-2">
              <span className="text-green-400">💻</span>
              <span className="text-cyan-300">Développeur d'applications</span>
              <span className="text-purple-400">•</span>
              <span className="text-pink-300">Solutions digitales sur mesure</span>
              <span className="text-green-400">💻</span>
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

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-10 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400 neon-flicker" />
              <span className="text-purple-300/70 text-sm font-medium tracking-widest uppercase">Collection Disponible</span>
              <Sparkles className="w-5 h-5 text-yellow-400 neon-flicker" />
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight shimmer-text">
              {store.settings.name}
            </h2>
            <p className="text-purple-300/50 text-lg mb-6">{store.settings.slogan}</p>

            {/* Search bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article, une catégorie..."
                className="w-full pl-12 pr-12 py-4 bg-[#12121a] border border-purple-500/20 text-white rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.1)] focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 outline-none text-sm placeholder-gray-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">{publishedArticles.length}</span> articles
              </span>
              {store.settings.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300/70">{store.settings.address}</span>
                </span>
              )}
              {store.settings.whatsappNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-green-300/70">{store.settings.whatsappNumber}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed top-0 left-0 h-full w-72 bg-[#0d0d15] border-r border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] z-40 lg:hidden overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-glow-purple">Catégories</h3>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-purple-500/10 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-1">
                {CATEGORIES_FILTER.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setShowMobileMenu(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-purple-500/5'
                    }`}
                  >
                    <span>{cat}</span>
                    {categoryCounts[cat] !== undefined && (
                      <span className="text-xs bg-purple-500/10 px-2 py-0.5 rounded-full text-purple-400">{categoryCounts[cat]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-5 h-5 text-purple-500/50 flex-shrink-0" />
          {CATEGORIES_FILTER.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'btn-neon-purple text-white'
                  : 'bg-[#12121a] border border-purple-500/10 text-gray-500 hover:text-white hover:border-purple-500/30'
              }`}
            >
              {cat}
              {categoryCounts[cat] !== undefined && (
                <span className={`ml-1 text-xs ${selectedCategory === cat ? 'text-purple-200' : 'text-gray-600'}`}>
                  ({categoryCounts[cat]})
                </span>
              )}
            </button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredArticles.length} résultat{filteredArticles.length !== 1 ? 's' : ''} pour "<span className="text-purple-400">{searchQuery}</span>"
          </p>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-20 h-20 text-purple-500/15 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Aucun article dans cette catégorie'}
            </p>
            {(searchQuery || selectedCategory !== 'Tous') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); }}
                className="mt-4 px-4 py-2 btn-neon-cyan text-white rounded-xl text-sm font-medium"
              >
                ✨ Voir tous les articles
              </button>
            )}
          </div>
        ) : (
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
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0d0d15] border-t border-purple-500/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {store.settings.logo ? (
                  <img src={store.settings.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <ShoppingBag className="w-6 h-6 text-purple-400" />
                  </div>
                )}
                <h3 className="font-bold text-lg shimmer-text">{store.settings.name}</h3>
              </div>
              <p className="text-gray-500 text-sm">{store.settings.slogan}</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-300 mb-3">Contact</h4>
              {store.settings.address && (
                <p className="text-gray-500 text-sm flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-cyan-500/50" /> {store.settings.address}
                </p>
              )}
              {store.settings.whatsappNumber && (
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500/50" /> {store.settings.whatsappNumber}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-bold text-purple-300 mb-3">Devises acceptées</h4>
              <div className="flex gap-3">
                <span className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">🇨🇩 FC</span>
                <span className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-sm text-cyan-300">🇺🇸 USD</span>
              </div>
            </div>
          </div>

          {/* Bottom marquee in footer */}
          <div className="border-t border-purple-500/10 mt-8 pt-6">
            <div className="overflow-hidden mb-4">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                <span className="text-xs font-medium flex items-center gap-2">
                  <span className="text-yellow-500">⚡</span>
                  <span className="text-gray-500">Créé par l'informaticien</span>
                  <span className="text-pink-400 font-bold">CHRISTIAN MBWETE</span>
                  <span className="text-gray-600">(+243895180889)</span>
                  <span className="text-yellow-500">⚡</span>
                </span>
                <span className="text-xs font-medium flex items-center gap-2">
                  <span className="text-cyan-500">💎</span>
                  <span className="text-gray-500">Solutions informatiques professionnelles</span>
                  <span className="text-cyan-500">💎</span>
                </span>
                <span className="text-xs font-medium flex items-center gap-2">
                  <span className="text-yellow-500">⚡</span>
                  <span className="text-gray-500">Créé par l'informaticien</span>
                  <span className="text-pink-400 font-bold">CHRISTIAN MBWETE</span>
                  <span className="text-gray-600">(+243895180889)</span>
                  <span className="text-yellow-500">⚡</span>
                </span>
                <span className="text-xs font-medium flex items-center gap-2">
                  <span className="text-cyan-500">💎</span>
                  <span className="text-gray-500">Solutions informatiques professionnelles</span>
                  <span className="text-cyan-500">💎</span>
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} {store.settings.name}. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
          onOrder={(article) => { setSelectedArticle(null); handleOrder(article); }}
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
