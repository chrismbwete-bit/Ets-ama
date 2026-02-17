// types/index.ts

export interface Article {
  id: string
  name: string
  description: string
  price_fc: number
  price_usd: number
  category: string
  sizes: string[]        // jsonb
  colors: string[]       // jsonb
  images: string[]       // jsonb
  stock: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
}

export interface Admin {
  id: string
  username: string
  email: string
  role: 'admin' | 'manager'
  created_at: string
}

export interface BoutiqueSettings {
  id: string
  name: string
  logo: string
  whatsapp_group_link: string
  whatsapp_number: string
  currency_fc: string
  currency_usd: string
  address: string
  slogan: string
  maintenance: boolean
}

export interface Notification {
  id: string
  article_id: string
  article_name: string
  message: string
  read: boolean
  created_at: string
}

export interface Order {
  id: string
  client_id: string
  client_name: string
  client_phone: string
  article_id: string
  article_name: string
  status: 'pending' | 'confirmed' | 'delivered'
  created_at: string
}
