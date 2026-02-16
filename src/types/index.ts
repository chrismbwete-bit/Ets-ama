export interface Article {
  id: string;
  name: string;
  description: string;
  priceFC: number;
  priceUSD: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  email: string;
}

export interface BoutiqueSettings {
  name: string;
  logo: string;
  whatsappGroupLink: string;
  whatsappNumber: string;
  currencyFC: string;
  currencyUSD: string;
  address: string;
  slogan: string;
}

export interface Notification {
  id: string;
  articleId: string;
  articleName: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  articleId: string;
  articleName: string;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}
