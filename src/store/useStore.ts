import { useState, useCallback } from 'react';
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

const SAMPLE_ARTICLES: Article[] = [
  {
    id: '1',
    name: 'Robe Élégante Soirée',
    description: 'Magnifique robe de soirée en tissu satin, parfaite pour les occasions spéciales. Coupe ajustée avec finitions dorées.',
    priceFC: 45000,
    priceUSD: 25,
    category: 'Robes',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Rouge', 'Bleu Marine'],
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    stock: 15,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Costume Homme Premium',
    description: 'Costume deux pièces en laine mélangée. Coupe moderne et confortable pour toutes les occasions.',
    priceFC: 85000,
    priceUSD: 47,
    category: 'Costumes',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Noir', 'Gris', 'Bleu'],
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
    stock: 10,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'T-Shirt Urban Style',
    description: 'T-shirt en coton bio avec imprimé tendance. Confort absolu au quotidien.',
    priceFC: 15000,
    priceUSD: 8,
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Noir', 'Gris'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    stock: 50,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Jean Slim Fit',
    description: 'Jean stretch slim fit, denim premium. Parfait pour un look décontracté chic.',
    priceFC: 35000,
    priceUSD: 19,
    category: 'Jeans',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Bleu', 'Noir', 'Gris'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
    stock: 30,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Veste en Cuir',
    description: 'Veste en simili-cuir de haute qualité. Style biker intemporel.',
    priceFC: 65000,
    priceUSD: 36,
    category: 'Vestes',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Marron'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
    stock: 8,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Robe Africaine Wax',
    description: 'Robe traditionnelle en tissu wax coloré. Design unique fait main.',
    priceFC: 55000,
    priceUSD: 30,
    category: 'Robes',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Multicolore', 'Jaune/Bleu', 'Rouge/Vert'],
    images: ['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400'],
    stock: 12,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
  const [articles, setArticles] = useState<Article[]>(() =>
    loadFromStorage('boutique_articles', SAMPLE_ARTICLES)
  );
  const [clients, setClients] = useState<Client[]>(() =>
    loadFromStorage('boutique_clients', [])
  );
  const [admin, setAdmin] = useState<Admin>(() =>
    loadFromStorage('boutique_admin', DEFAULT_ADMIN)
  );
  const [settings, setSettings] = useState<BoutiqueSettings>(() =>
    loadFromStorage('boutique_settings', DEFAULT_SETTINGS)
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage('boutique_notifications', [])
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('boutique_orders', [])
  );

  const addArticle = useCallback((article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setArticles(prev => {
      const updated = [...prev, newArticle];
      saveToStorage('boutique_articles', updated);
      return updated;
    });

    if (article.published) {
      const notif: Notification = {
        id: Date.now().toString(),
        articleId: newArticle.id,
        articleName: newArticle.name,
        message: `🆕 Nouvel article disponible: ${newArticle.name} - ${newArticle.priceFC} FC / ${newArticle.priceUSD} USD`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => {
        const updated = [notif, ...prev];
        saveToStorage('boutique_notifications', updated);
        return updated;
      });
    }

    return newArticle;
  }, []);

  const updateArticle = useCallback((id: string, data: Partial<Article>) => {
    setArticles(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a);
      saveToStorage('boutique_articles', updated);
      return updated;
    });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveToStorage('boutique_articles', updated);
      return updated;
    });
  }, []);

  const publishArticle = useCallback((id: string) => {
    setArticles(prev => {
      const article = prev.find(a => a.id === id);
      if (!article) return prev;
      const updated = prev.map(a => a.id === id ? { ...a, published: true, updatedAt: new Date().toISOString() } : a);
      saveToStorage('boutique_articles', updated);

      const notif: Notification = {
        id: Date.now().toString(),
        articleId: id,
        articleName: article.name,
        message: `📢 Article publié: ${article.name} - ${article.priceFC} FC / ${article.priceUSD} USD`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev2 => {
        const updatedN = [notif, ...prev2];
        saveToStorage('boutique_notifications', updatedN);
        return updatedN;
      });

      return updated;
    });
  }, []);

  const registerClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>) => {
    const existing = clients.find(c => c.phone === data.phone);
    if (existing) return null;
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

  const loginClient = useCallback((phone: string, password: string): Client | null => {
    return clients.find(c => c.phone === phone && c.password === password) || null;
  }, [clients]);

  const recoverPassword = useCallback((phone: string): string | null => {
    const client = clients.find(c => c.phone === phone);
    if (client) return client.password;
    return null;
  }, [clients]);

  const loginAdmin = useCallback((username: string, password: string): boolean => {
    return admin.username === username && admin.password === password;
  }, [admin]);

  const getAdminCredentials = useCallback((): { username: string; password: string } => {
    return { username: admin.username, password: admin.password };
  }, [admin]);

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
