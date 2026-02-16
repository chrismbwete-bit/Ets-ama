import { useState, useRef } from 'react';
import {
  X, Plus, Trash2, Edit3, Image, Save, Package,
  Settings, Users, ShoppingBag, BarChart3, Eye, EyeOff,
  Upload, ArrowLeft, Lock, Camera, ImagePlus, XCircle, KeyRound
} from 'lucide-react';
import type { Article, BoutiqueSettings, Client, Order } from '../types';

interface AdminPanelProps {
  articles: Article[];
  settings: BoutiqueSettings;
  clients: Client[];
  orders: Order[];
  onClose: () => void;
  onAddArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateArticle: (id: string, data: Partial<Article>) => void;
  onDeleteArticle: (id: string) => void;
  onPublishArticle: (id: string) => void;
  onUpdateSettings: (data: Partial<BoutiqueSettings>) => void;
  onChangeAdminPassword: (currentPassword: string, newPassword: string) => boolean;
}

const CATEGORIES = ['Robes', 'Costumes', 'T-Shirts', 'Jeans', 'Vestes', 'Chaussures', 'Accessoires', 'Sous-vêtements', 'Sport', 'Enfants', 'Autre'];

export function AdminPanel({
  articles, settings, clients, orders, onClose,
  onAddArticle, onUpdateArticle, onDeleteArticle, onPublishArticle,
  onUpdateSettings, onChangeAdminPassword,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'add' | 'edit' | 'settings' | 'clients' | 'orders' | 'password'>('dashboard');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriceFC, setFormPriceFC] = useState('');
  const [formPriceUSD, setFormPriceUSD] = useState('');
  const [formCategory, setFormCategory] = useState('Robes');
  const [formSizes, setFormSizes] = useState('');
  const [formColors, setFormColors] = useState('');
  const [formImagesList, setFormImagesList] = useState<string[]>([]);
  const [formStock, setFormStock] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const articleImageInputRef = useRef<HTMLInputElement>(null);

  const [settingsName, setSettingsName] = useState(settings.name);
  const [settingsLogo, setSettingsLogo] = useState(settings.logo);
  const [settingsSlogan, setSettingsSlogan] = useState(settings.slogan);
  const [settingsAddress, setSettingsAddress] = useState(settings.address);
  const [settingsWhatsappGroup, setSettingsWhatsappGroup] = useState(settings.whatsappGroupLink);
  const [settingsWhatsappNumber, setSettingsWhatsappNumber] = useState(settings.whatsappNumber);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const inputClass = "w-full px-4 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition";

  const resetForm = () => {
    setFormName(''); setFormDescription(''); setFormPriceFC(''); setFormPriceUSD('');
    setFormCategory('Robes'); setFormSizes(''); setFormColors(''); setFormImagesList([]);
    setFormStock(''); setFormPublished(true);
  };

  const loadArticleToEdit = (article: Article) => {
    setEditingArticle(article); setFormName(article.name); setFormDescription(article.description);
    setFormPriceFC(article.priceFC.toString()); setFormPriceUSD(article.priceUSD.toString());
    setFormCategory(article.category); setFormSizes(article.sizes.join(', '));
    setFormColors(article.colors.join(', ')); setFormImagesList([...article.images]);
    setFormStock(article.stock.toString()); setFormPublished(article.published); setActiveTab('edit');
  };

  const handleSubmitArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formName, description: formDescription,
      priceFC: Number(formPriceFC) || 0, priceUSD: Number(formPriceUSD) || 0,
      category: formCategory, sizes: formSizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formColors.split(',').map(s => s.trim()).filter(Boolean),
      images: formImagesList.filter(Boolean), stock: Number(formStock) || 0, published: formPublished,
    };
    if (activeTab === 'edit' && editingArticle) { onUpdateArticle(editingArticle.id, data); setEditingArticle(null); }
    else { onAddArticle(data); }
    resetForm(); setActiveTab('articles');
  };

  const handleSaveSettings = () => {
    onUpdateSettings({ name: settingsName, logo: settingsLogo, slogan: settingsSlogan, address: settingsAddress, whatsappGroupLink: settingsWhatsappGroup, whatsappNumber: settingsWhatsappNumber });
    setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleArticleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => { setFormImagesList(prev => [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url && url.trim()) setFormImagesList(prev => [...prev, url.trim()]);
  };

  const handleRemoveImage = (index: number) => { setFormImagesList(prev => prev.filter((_, i) => i !== index)); };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('Image trop volumineuse. Max 5 Mo.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setSettingsLogo(reader.result as string); };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError(''); setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmNewPassword) { setPasswordError('Veuillez remplir tous les champs'); return; }
    if (newPassword.length < 4) { setPasswordError('Min. 4 caractères requis'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError('Les mots de passe ne correspondent pas'); return; }
    if (currentPassword === newPassword) { setPasswordError('Le nouveau doit être différent de l\'ancien'); return; }
    if (onChangeAdminPassword(currentPassword, newPassword)) {
      setPasswordSuccess('✅ Mot de passe modifié avec succès !');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
    } else { setPasswordError('Le mot de passe actuel est incorrect'); }
  };

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.published).length;
  const totalClients = clients.length;
  const totalOrders = orders.length;

  const tabs = [
    { id: 'dashboard' as const, label: 'Tableau de bord', icon: BarChart3 },
    { id: 'articles' as const, label: 'Articles', icon: Package },
    { id: 'orders' as const, label: 'Commandes', icon: ShoppingBag },
    { id: 'clients' as const, label: 'Clients', icon: Users },
    { id: 'settings' as const, label: 'Paramètres', icon: Settings },
    { id: 'password' as const, label: 'Mot de passe', icon: Lock },
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-50 overflow-y-auto">
      {/* Admin Header */}
      <div className="bg-[#0d0d15]/95 backdrop-blur-xl border-b border-purple-500/20 text-white p-4 sticky top-0 z-10 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-purple-500/10 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-purple-400" />
            </button>
            <h1 className="font-bold text-lg shimmer-text">🛡️ Panneau d'Administration</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-purple-500/10 rounded-lg transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'btn-neon-purple text-white'
                  : 'bg-[#12121a] border border-purple-500/10 text-gray-400 hover:text-white hover:border-purple-500/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Articles', value: totalArticles, icon: Package, color: 'purple' },
                { label: 'Publiés', value: publishedArticles, icon: Eye, color: 'green' },
                { label: 'Clients', value: totalClients, icon: Users, color: 'cyan' },
                { label: 'Commandes', value: totalOrders, icon: ShoppingBag, color: 'orange' },
              ].map(stat => (
                <div key={stat.label} className="card-dark rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${stat.color === 'purple' ? 'purple' : stat.color === 'green' ? 'green' : stat.color === 'cyan' ? 'cyan' : 'orange'}-500/10 rounded-xl flex items-center justify-center border border-${stat.color}-500/20`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color === 'purple' ? 'purple' : stat.color === 'green' ? 'green' : stat.color === 'cyan' ? 'cyan' : 'orange'}-400`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-dark rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 text-glow-purple">⚡ Actions rapides</h3>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Ajouter Article', icon: Plus, color: 'purple', action: () => { resetForm(); setActiveTab('add'); } },
                  { label: 'Gérer Articles', icon: Package, color: 'cyan', action: () => setActiveTab('articles') },
                  { label: 'Paramètres', icon: Settings, color: 'green', action: () => setActiveTab('settings') },
                  { label: 'Commandes', icon: ShoppingBag, color: 'orange', action: () => setActiveTab('orders') },
                  { label: 'Mot de passe', icon: Lock, color: 'pink', action: () => setActiveTab('password') },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`p-4 rounded-xl text-center transition border border-${item.color === 'purple' ? 'purple' : item.color === 'cyan' ? 'cyan' : item.color === 'green' ? 'green' : item.color === 'orange' ? 'orange' : 'pink'}-500/10 bg-${item.color === 'purple' ? 'purple' : item.color === 'cyan' ? 'cyan' : item.color === 'green' ? 'green' : item.color === 'orange' ? 'orange' : 'pink'}-500/5 hover:bg-${item.color}-500/10 hover:border-${item.color}-500/30`}
                  >
                    <item.icon className={`w-8 h-8 text-${item.color === 'purple' ? 'purple' : item.color === 'cyan' ? 'cyan' : item.color === 'green' ? 'green' : item.color === 'orange' ? 'orange' : 'pink'}-400 mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-300">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Articles List */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white text-glow-purple">📦 Gestion des Articles</h2>
              <button onClick={() => { resetForm(); setActiveTab('add'); }} className="flex items-center gap-2 px-4 py-2 btn-neon-purple text-white rounded-xl font-medium">
                <Plus className="w-5 h-5" /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {articles.map(article => (
                <div key={article.id} className="card-dark rounded-xl p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#0d0d15] flex-shrink-0 border border-purple-500/10">
                      {article.images[0] ? (
                        <img src={article.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-500/20"><Image className="w-8 h-8" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white truncate">{article.name}</h3>
                          <p className="text-sm text-gray-500">{article.category} • Stock: {article.stock}</p>
                          <p className="text-sm font-bold text-purple-400">{article.priceFC.toLocaleString()} FC / {article.priceUSD} USD</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                          article.published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {article.published ? '✨ Publié' : '📝 Brouillon'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-purple-500/10 flex-wrap">
                    {!article.published && (
                      <button onClick={() => onPublishArticle(article.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium hover:bg-green-500/20 transition">
                        <Eye className="w-4 h-4" /> Publier
                      </button>
                    )}
                    {article.published && (
                      <button onClick={() => onUpdateArticle(article.id, { published: false })} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition">
                        <EyeOff className="w-4 h-4" /> Dépublier
                      </button>
                    )}
                    <button onClick={() => loadArticleToEdit(article)} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition">
                      <Edit3 className="w-4 h-4" /> Modifier
                    </button>
                    {deleteConfirm === article.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { onDeleteArticle(article.id); setDeleteConfirm(null); }} className="px-3 py-1.5 btn-neon-red text-white rounded-lg text-sm font-medium">Confirmer</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-500/20 transition">Annuler</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(article.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition">
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="card-dark rounded-2xl p-12 text-center">
                  <Package className="w-16 h-16 text-purple-500/20 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun article</p>
                  <button onClick={() => { resetForm(); setActiveTab('add'); }} className="mt-4 px-4 py-2 btn-neon-purple text-white rounded-xl text-sm font-medium">Ajouter votre premier article</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add / Edit Article Form */}
        {(activeTab === 'add' || activeTab === 'edit') && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setActiveTab('articles')} className="p-2 hover:bg-purple-500/10 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-purple-400" />
              </button>
              <h2 className="text-xl font-bold text-white text-glow-purple">
                {activeTab === 'edit' ? '✏️ Modifier l\'article' : '➕ Ajouter un article'}
              </h2>
            </div>
            <form onSubmit={handleSubmitArticle} className="card-dark rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Nom de l'article *</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Ex: Robe Élégante Soirée" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Description *</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} required rows={3} placeholder="Décrivez l'article..." className={inputClass + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">💰 Prix FC *</label>
                  <input type="number" value={formPriceFC} onChange={e => setFormPriceFC(e.target.value)} required placeholder="45000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-1">💵 Prix USD *</label>
                  <input type="number" value={formPriceUSD} onChange={e => setFormPriceUSD(e.target.value)} required placeholder="25" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Catégorie</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className={inputClass}>
                    {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Stock</label>
                  <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} placeholder="10" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Tailles (virgules)</label>
                <input type="text" value={formSizes} onChange={e => setFormSizes(e.target.value)} placeholder="S, M, L, XL" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Couleurs (virgules)</label>
                <input type="text" value={formColors} onChange={e => setFormColors(e.target.value)} placeholder="Noir, Blanc, Rouge" className={inputClass} />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">📸 Images</label>
                {formImagesList.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                    {formImagesList.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-purple-500/20 bg-[#0d0d15]">
                        <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1a2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%234a4a6e" font-size="10">Erreur</text></svg>'; }}
                        />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <XCircle className="w-5 h-5" />
                        </button>
                        {index === 0 && (<span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow-[0_0_5px_rgba(168,85,247,0.5)]">Principale</span>)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <input ref={articleImageInputRef} type="file" accept="image/*" multiple onChange={handleArticleImageUpload} className="hidden" />
                  <button type="button" onClick={() => articleImageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-300 rounded-xl hover:bg-purple-500/20 transition text-sm font-medium border border-dashed border-purple-500/30">
                    <Camera className="w-4 h-4" /> 📱 Téléphone / PC
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-300 rounded-xl hover:bg-green-500/20 transition text-sm font-medium border border-dashed border-green-500/30 cursor-pointer">
                    <ImagePlus className="w-4 h-4" /> 📷 Photo
                    <input type="file" accept="image/*" capture="environment" onChange={handleArticleImageUpload} className="hidden" />
                  </label>
                  <button type="button" onClick={handleAddImageUrl} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 text-cyan-300 rounded-xl hover:bg-cyan-500/20 transition text-sm font-medium border border-dashed border-cyan-500/30">
                    <Upload className="w-4 h-4" /> 🔗 URL
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">💡 Max 5 Mo par image. Première = principale.</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={formPublished} onChange={e => setFormPublished(e.target.checked)} className="w-4 h-4 accent-purple-500 bg-[#0d0d15] rounded" />
                <label htmlFor="published" className="text-sm text-gray-400">Publier immédiatement</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActiveTab('articles')} className="flex-1 py-3 border border-purple-500/20 text-gray-400 rounded-xl font-medium hover:bg-purple-500/5 transition">Annuler</button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 btn-neon-purple text-white rounded-xl font-bold">
                  <Save className="w-5 h-5" /> {activeTab === 'edit' ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white text-glow-purple mb-6">⚙️ Paramètres</h2>
            <div className="card-dark rounded-2xl p-6 space-y-6">
              {settingsSaved && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium animate-fade-in">✅ Paramètres enregistrés !</div>
              )}
              <div className="text-center">
                <p className="text-sm font-bold text-purple-300 mb-3">📷 Logo</p>
                <div className="flex flex-col items-center gap-3">
                  {settingsLogo ? (
                    <div className="relative group">
                      <img src={settingsLogo} alt="Logo" className="w-28 h-28 rounded-full object-cover border-4 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
                      <button type="button" onClick={() => setSettingsLogo('')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><XCircle className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-purple-500/10 flex items-center justify-center border-4 border-dashed border-purple-500/20">
                      <ShoppingBag className="w-12 h-12 text-purple-500/30" />
                    </div>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-300 rounded-xl hover:bg-purple-500/20 transition text-sm font-medium border border-purple-500/20">
                      <Camera className="w-4 h-4" /> 📱 Téléphone / PC
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-300 rounded-xl hover:bg-green-500/20 transition text-sm font-medium cursor-pointer border border-green-500/20">
                      <ImagePlus className="w-4 h-4" /> 📷 Photo
                      <input type="file" accept="image/*" capture="user" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-gray-600 mb-1 text-center">Ou URL :</p>
                    <input type="text" value={settingsLogo} onChange={e => setSettingsLogo(e.target.value)} placeholder="https://example.com/logo.png" className={inputClass + " text-sm"} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Nom de la boutique</label>
                <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} placeholder="Ma Boutique Mode" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Slogan</label>
                <input type="text" value={settingsSlogan} onChange={e => setSettingsSlogan(e.target.value)} placeholder="La mode à votre portée" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Adresse</label>
                <input type="text" value={settingsAddress} onChange={e => setSettingsAddress(e.target.value)} placeholder="123 Avenue, Kinshasa" className={inputClass} />
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-green-400 flex items-center gap-2">📱 WhatsApp</h3>
                <div>
                  <label className="block text-sm font-medium text-green-300 mb-1">Lien groupe WhatsApp</label>
                  <input type="url" value={settingsWhatsappGroup} onChange={e => setSettingsWhatsappGroup(e.target.value)} placeholder="https://chat.whatsapp.com/xxx" className="w-full px-4 py-3 bg-[#0d0d15] border border-green-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-300 mb-1">Numéro WhatsApp</label>
                  <input type="tel" value={settingsWhatsappNumber} onChange={e => setSettingsWhatsappNumber(e.target.value)} placeholder="+243 XXX XXX XXX" className="w-full px-4 py-3 bg-[#0d0d15] border border-green-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 outline-none transition" />
                </div>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">💰 Devises</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-[#0d0d15] px-3 py-2 rounded-lg border border-purple-500/10">
                    <span className="font-bold text-purple-400">🇨🇩 FC</span>
                    <span className="text-sm text-gray-500">Franc Congolais</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0d0d15] px-3 py-2 rounded-lg border border-cyan-500/10">
                    <span className="font-bold text-cyan-400">🇺🇸 USD</span>
                    <span className="text-sm text-gray-500">Dollar</span>
                  </div>
                </div>
              </div>
              <button onClick={handleSaveSettings} className="w-full flex items-center justify-center gap-2 py-3 btn-neon-green text-white rounded-xl font-bold">
                <Save className="w-5 h-5" /> ✨ Enregistrer
              </button>
            </div>
          </div>
        )}

        {/* Password */}
        {activeTab === 'password' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-white text-glow-purple mb-6">🔐 Mot de passe admin</h2>
            <form onSubmit={handleChangePassword} className="card-dark rounded-2xl p-6 space-y-5">
              <div className="text-center mb-2">
                <div className="w-20 h-20 bg-pink-500/10 border border-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                  <KeyRound className="w-10 h-10 text-pink-400" />
                </div>
              </div>
              {passwordError && (<div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">❌ {passwordError}</div>)}
              {passwordSuccess && (<div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm">{passwordSuccess}</div>)}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type={showCurrentPwd ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Actuel" className="w-full pl-11 pr-11 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition" />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showCurrentPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 4 caractères" className="w-full pl-11 pr-11 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition" />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 4 && (<p className="text-xs text-red-400 mt-1">⚠️ Min. 4 caractères</p>)}
                {newPassword.length >= 4 && (<p className="text-xs text-green-400 mt-1">✅ OK</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Confirmer</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Retapez" className="w-full pl-11 pr-4 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition" />
                </div>
                {confirmNewPassword.length > 0 && confirmNewPassword !== newPassword && (<p className="text-xs text-red-400 mt-1">❌ Ne correspond pas</p>)}
                {confirmNewPassword.length > 0 && confirmNewPassword === newPassword && newPassword.length >= 4 && (<p className="text-xs text-green-400 mt-1">✅ Correspond</p>)}
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 btn-neon-pink text-white rounded-xl font-bold">
                <Lock className="w-5 h-5" /> ✨ Changer le mot de passe
              </button>
            </form>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-glow-purple">👥 Clients ({clients.length})</h2>
            {clients.length === 0 ? (
              <div className="card-dark rounded-2xl p-12 text-center">
                <Users className="w-16 h-16 text-purple-500/20 mx-auto mb-3" />
                <p className="text-gray-500">Aucun client inscrit</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {clients.map(client => (
                  <div key={client.id} className="card-dark rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 font-bold">{client.firstName[0]}{client.lastName[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{client.firstName} {client.lastName}</p>
                      <p className="text-sm text-gray-500">📱 {client.phone}</p>
                      <p className="text-xs text-gray-600">Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-glow-purple">📦 Commandes ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="card-dark rounded-2xl p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-purple-500/20 mx-auto mb-3" />
                <p className="text-gray-500">Aucune commande</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {orders.map(order => (
                  <div key={order.id} className="card-dark rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-white">{order.articleName}</p>
                        <p className="text-sm text-gray-400">👤 {order.clientName}</p>
                        <p className="text-sm text-gray-500">📱 {order.clientPhone}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        order.status === 'confirmed' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {order.status === 'pending' ? '⏳ En attente' : order.status === 'confirmed' ? '✅ Confirmée' : '📦 Livrée'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
