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

  // --- FETCH ARTICLES ---
  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data as Article[]);
    } else if (error) {
      console.error("Erreur fetchArticles:", error);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // --- ADD ARTICLE ---
  const addArticle = useCallback(async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newArticleData = {
        ...article,
        sizes: JSON.stringify(article.sizes),
        colors: JSON.stringify(article.colors),
        images: JSON.stringify(article.images),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([newArticleData])
        .select('*');

      if (error) throw error;

      const savedArticle = data[0] as Article;
      setArticles(prev => [savedArticle, ...prev]);

      // Notification si publié
      if (savedArticle.published) {
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
    } catch (err) {
      console.error("Erreur addArticle:", err);
      return null;
    }
  }, []);

  // --- UPDATE ARTICLE ---
  const updateArticle = useCallback(async (id: string, data: Partial<Article>) => {
    try {
      const updateData: any = { ...data, updated_at: new Date().toISOString() };
      if (updateData.sizes) updateData.sizes = JSON.stringify(updateData.sizes);
      if (updateData.colors) updateData.colors = JSON.stringify(updateData.colors);
      if (updateData.images) updateData.images = JSON.stringify(updateData.images);

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setArticles(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    } catch (err) {
      console.error("Erreur updateArticle:", err);
    }
  }, []);

  // --- DELETE ARTICLE ---
  const deleteArticle = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erreur deleteArticle:", err);
    }
  }, []);

  // --- PUBLISH ARTICLE ---
  const publishArticle = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ published: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setArticles(prev => prev.map(a => a.id === id ? { ...a, published: true } : a));

      const article = articles.find(a => a.id === id);
      if (article) {
        const notif: Notification = {
          id: Date.now().toString(),
          articleId: article.id,
          articleName: article.name,
          message: `🆕 Nouvel article publié: ${article.name}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        setNotifications(prev => {
          const updated = [notif, ...prev];
          saveToStorage('boutique_notifications', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error("Erreur publishArticle:", err);
    }
  }, [articles]);

  // --- RESTE DES FONCTIONS (clients, admin, orders, notifications) ---
  // [Conserver exactement celles déjà existantes]

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
    // ...reste functions
  };
}
