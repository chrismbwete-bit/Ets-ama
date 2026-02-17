import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
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
  } catch {}
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useStore() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('boutique_clients', []));
  const [admin, setAdmin] = useState<Admin>(() => loadFromStorage('boutique_admin', DEFAULT_ADMIN));
  const [settings, setSettings] = useState<BoutiqueSettings>(() => loadFromStorage('boutique_settings', DEFAULT_SETTINGS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('boutique_notifications', []));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('boutique_orders', []));

  // ================= FETCH ARTICLES =================
  const fetchArticles = useCallback(async () => {
    try {
      if (!supabase) {
        console.error("Supabase non initialisé");
        return;
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*');

      if (error) {
        console.error("Erreur Supabase:", error);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Format data invalide:", data);
        return;
      }

      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name || "",
        price: item.price || 0,
        description: item.description || "",
        category: item.category || "Autre",
        image: item.image || "",
        published: item.published === true,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      }));

      setArticles(mapped as Article[]);
    } catch (e) {
      console.error("Crash fetchArticles:", e);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ================= ARTICLES =================
  const addArticle = useCallback(async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!supabase) return null;

    const payload = {
      ...article,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('articles')
      .insert([payload])
      .select();

    if (error || !data) return null;

    fetchArticles();
    return data[0];
  }, [fetchArticles]);

  const updateArticle = useCallback(async (id: string, data: Partial<Article>) => {
    if (!supabase) return;

    await supabase
      .from('articles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    fetchArticles();
  }, [fetchArticles]);

  const deleteArticle = useCallback(async (id: string) => {
    if (!supabase) return;

    await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    fetchArticles();
  }, [fetchArticles]);

  const publishArticle = useCallback(async (id: string) => {
    if (!supabase) return;

    await supabase
      .from('articles')
      .update({ published: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    fetchArticles();
  }, [fetchArticles]);

  // ================= CLIENTS =================
  const registerClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>) => {
    const existing = clients.find(c => c.phone === data.phone);
    if (existing) return null;

    const newClient: Client = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
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

  // ================= ADMIN =================
  const loginAdmin = useCallback((username: string, password: string) => {
    return admin.username === username && admin.password === password;
  }, [admin]);

  const getAdminCredentials = useCallback(() => ({
    username: admin.username,
    password: admin.password
  }), [admin]);

  const changeAdminPassword = useCallback((current: string, next: string) => {
    if (admin.password !== current) return false;

    setAdmin(prev => {
      const updated = { ...prev, password: next };
      saveToStorage('boutique_admin', updated);
      return updated;
    });

    return true;
  }, [admin]);

  // ================= SETTINGS =================
  const updateSettings = useCallback((data: Partial<BoutiqueSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...data };
      saveToStorage('boutique_settings', updated);
      return updated;
    });
  }, []);

  // ================= NOTIFS =================
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

  // ================= ORDERS =================
  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      saveToStorage('boutique_orders', updated);
      return updated;
    });

    return newOrder;
  }, []);

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
