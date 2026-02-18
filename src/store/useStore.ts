import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import type { Article, Client, Admin, BoutiqueSettings, Notification, Order } from '../types';

/* =========================
   CONFIG PAR DÉFAUT
========================= */

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

/* =========================
   STORAGE UTILS
========================= */

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Storage load error:', key);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save error:', key);
  }
}

/* =========================
   MAPPING SUPABASE → TS
========================= */

function mapArticle(db: any): Article {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    priceFC: Number(db.price_fc),
    priceUSD: Number(db.price_usd),
    category: db.category,
    sizes: db.sizes || [],
    colors: db.colors || [],
    images: db.images || [],
    stock: db.stock,
    published: db.published,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

/* =========================
   STORE
========================= */

export function useStore() {

  /* ===== STATES ===== */

  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('boutique_clients', []));
  const [admin, setAdmin] = useState<Admin>(() => loadFromStorage('boutique_admin', DEFAULT_ADMIN));
  const [settings, setSettings] = useState<BoutiqueSettings>(() => loadFromStorage('boutique_settings', DEFAULT_SETTINGS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('boutique_notifications', []));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('boutique_orders', []));

  /* =========================
     SUPABASE FETCH
  ========================= */

  const fetchArticles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false }); // snake_case

      if (error) {
        console.error('❌ Supabase fetchArticles error:', error.message);
        return;
      }

      if (data) {
        const mapped = data.map(mapArticle);
        setArticles(mapped);
      }
    } catch (e) {
      console.error('🔥 fetchArticles crash:', e);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  /* =========================
     ARTICLES ACTIONS
  ========================= */

  const addArticle = useCallback(async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const payload = {
        name: article.name,
        description: article.description,
        price_fc: article.priceFC,
        price_usd: article.priceUSD,
        category: article.category,
        sizes: article.sizes,
        colors: article.colors,
        images: article.images,
        stock: article.stock,
        published: article.published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([payload])
        .select();

      if (error) {
        console.error('❌ Supabase addArticle error:', error.message);
        return null;
      }

      if (data && data[0]) {
        const saved = mapArticle(data[0]);
        setArticles(prev => [saved, ...prev]);
        return saved;
      }

      return null;
    } catch (e) {
      console.error('🔥 addArticle crash:', e);
      return null;
    }
  }, []);

  const updateArticle = useCallback(async (id: string, data: Partial<Article>) => {
    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.name) payload.name = data.name;
      if (data.description) payload.description = data.description;
      if (data.priceFC !== undefined) payload.price_fc = data.priceFC;
      if (data.priceUSD !== undefined) payload.price_usd = data.priceUSD;
      if (data.category) payload.category = data.category;
      if (data.sizes) payload.sizes = data.sizes;
      if (data.colors) payload.colors = data.colors;
      if (data.images) payload.images = data.images;
      if (data.stock !== undefined) payload.stock = data.stock;
      if (data.published !== undefined) payload.published = data.published;

      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase updateArticle error:', error.message);
        return;
      }

      fetchArticles();
    } catch (e) {
      console.error('🔥 updateArticle crash:', e);
    }
  }, [fetchArticles]);

  const deleteArticle = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase deleteArticle error:', error.message);
        return;
      }

      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error('🔥 deleteArticle crash:', e);
    }
  }, []);

  const publishArticle = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ 
          published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase publishArticle error:', error.message);
        return;
      }

      fetchArticles();
    } catch (e) {
      console.error('🔥 publishArticle crash:', e);
    }
  }, [fetchArticles]);

  /* =========================
     CLIENTS / AUTH
  ========================= */

  const registerClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>) => {
    const exists = clients.find(c => c.phone === data.phone);
    if (exists) return null;

    const newClient: Client = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setClients(prev => {
      const updated = [...prev, newClient];
      saveToStorage('boutique_clients', updated);
      return updated;
    });

    return newClient;
  }, [clients]);

  const loginClient = useCallback((phone: string, password: string) => {
    return clients.find(c => c.phone === phone && c.password === password) || null;
  }, [clients]);

  const recoverPassword = useCallback((phone: string) => {
    const client = clients.find(c => c.phone === phone);
    return client ? client.password : null;
  }, [clients]);

  /* =========================
     ADMIN
  ========================= */

  const loginAdmin = useCallback((username: string, password: string) => {
    return admin.username === username && admin.password === password;
  }, [admin]);

  const getAdminCredentials = useCallback(() => {
    return { username: admin.username, password: admin.password };
  }, [admin]);

  const changeAdminPassword = useCallback((current: string, next: string) => {
    if (admin.password !== current) return false;

    setAdmin(prev => {
      const updated = { ...prev, password: next };
      saveToStorage('boutique_admin', updated);
      return updated;
    });

    return true;
  }, [admin]);

  /* =========================
     SETTINGS
  ========================= */

  const updateSettings = useCallback((data: Partial<BoutiqueSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...data };
      saveToStorage('boutique_settings', updated);
      return updated;
    });
  }, []);

  /* =========================
     NOTIFICATIONS
  ========================= */

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

  /* =========================
     ORDERS
  ========================= */

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      saveToStorage('boutique_orders', updated);
      return updated;
    });

    return newOrder;
  }, []);

  /* =========================
     EXPORT
  ========================= */

  return {
    articles,
    fetchArticles,
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
