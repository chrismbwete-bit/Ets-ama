import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Importation du client Supabase
import type { Article, Client, Admin, BoutiqueSettings, Notification, Order } from '../types';

const DEFAULT_SETTINGS: BoutiqueSettings = {
  name: 'Ma Boutique Mode',
  logo: '',
  whatsappGroupLink: '',
  whatsappNumber: '',
  currencyFC: 'FC',
  currencyUSD: 'USD',
  address: '',
  slogan: 'La mode à votre portée',
};

const DEFAULT_ADMIN: Admin = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123',
  email: 'admin@boutique.com',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function useStore() {
  // Les articles sont initialisés vides et chargés via useEffect
  const [articles, setArticles] = useState<Article[]>([]);
  
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('boutique_clients', []));
  const [admin, setAdmin] = useState<Admin>(() => loadFromStorage('boutique_admin', DEFAULT_ADMIN));
  const [settings, setSettings] = useState<BoutiqueSettings>(() => loadFromStorage('boutique_settings', DEFAULT_SETTINGS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('boutique_notifications', []));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('boutique_orders', []));

  // --- CHARGEMENT INITIAL DEPUIS SUPABASE ---
  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!error && data) {
      setArticles(data as Article[]);
    } else if (error) {
      console.error("Erreur lors du chargement des articles:", error);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // --- ACTIONS ARTICLES (SUPABASE) ---

  const addArticle = useCallback(async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticleData = {
      ...article,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('articles')
      .insert([newArticleData])
      .select();

    if (!error && data) {
      const savedArticle = data[0] as Article;
      setArticles(prev => [savedArticle, ...prev]);

      if (article.published) {
        const notif: Notification = {
          id: Date.now().toString(),
          articleId: savedArticle.id,
          articleName: savedArticle.name,
          message: `🆕 Nouvel article: ${savedArticle.name}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        setNotifications(prev => {
          const updated = [notif, ...prev];
          saveToStorage('boutique_notifications', updated);
          return updated;
        });
      }
      return savedArticle;
    }
    return null;
  }, []);

  const updateArticle = useCallback(async (id: string, data: Partial<Article>) => {
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    
    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updateData } : a));
    }
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (!error) {
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  }, []);

  const publishArticle = useCallback(async (id: string) => {
    const updateData = { published: true, updatedAt: new Date().toISOString() };
    
    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updateData } : a));
    }
  }, []);

  // --- LE RESTE DES FONCTIONS (CONSERVÉES À L'IDENTIQUE) ---

  const registerClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>) => {
    const existing = clients.find(c => c.phone === data.phone);
    if (existing) return null;
    const newClient: Client = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setClients(prev => {
      const updated = [...prev, newClient];
      saveToStorage('boutique_clients', updated);
      return updated;
    });
    return newClient;
  }, [clients]);

  const loginClient = useCallback((phone: string, password: string): Client | null => {
    return clients.find(c => c.phone === phone && c.password === password) || null;
  }, [clients]);

  const recoverPassword = useCallback((phone: string): string | null => {
    const client = clients.find(c => c.phone === phone);
    return client ? client.password : null;
  }, [clients]);

  const loginAdmin = useCallback((username: string, password: string): boolean => {
    return admin.username === username && admin.password === password;
  }, [admin]);

  const getAdminCredentials = useCallback(() => ({ username: admin.username, password: admin.password }), [admin]);

  const changeAdminPassword = useCallback((currentPassword: string, newPassword: string): boolean => {
    if (admin.password !== currentPassword) return false;
    setAdmin(prev => {
      const updated = { ...prev, password: newPassword };
      saveToStorage('boutique_admin', updated);
      return updated;
    });
    return true;
  }, [admin]);

  const updateSettings = useCallback((data: Partial<BoutiqueSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...data };
      saveToStorage('boutique_settings', updated);
      return updated;
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveToStorage('boutique_notifications', updated);
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveToStorage('boutique_notifications', updated);
      return updated;
    });
  }, []);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = { ...order, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() };
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      saveToStorage('boutique_orders', updated);
      return updated;
    });
    return newOrder;
  }, []);

  return {
    articles,
    clients,
    admin,
    settings,
    notifications,
    orders,
    addArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    registerClient,
    loginClient,
    recoverPassword,
    loginAdmin,
    changeAdminPassword,
    getAdminCredentials,
    updateSettings,
    markNotificationRead,
    markAllNotificationsRead,
    addOrder,
  };
}
