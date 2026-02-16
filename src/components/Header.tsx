import { useState } from 'react';
import { Bell, Menu, ShoppingBag, LogOut, Settings, User } from 'lucide-react';
import type { BoutiqueSettings, Notification } from '../types';

interface HeaderProps {
  settings: BoutiqueSettings;
  notifications: Notification[];
  isAdmin: boolean;
  isClient: boolean;
  clientName?: string;
  onMenuToggle: () => void;
  onNotificationsClick: () => void;
  onLogout: () => void;
  onAdminPanel: () => void;
  onLoginClick: () => void;
}

export function Header({
  settings,
  notifications,
  isAdmin,
  isClient,
  clientName,
  onMenuToggle,
  onNotificationsClick,
  onLogout,
  onAdminPanel,
  onLoginClick,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#0d0d15]/95 backdrop-blur-xl border-b border-purple-500/20 text-white shadow-[0_0_30px_rgba(168,85,247,0.15)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-purple-500/20 rounded-lg transition">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg leading-tight shimmer-text">{settings.name || 'Ma Boutique'}</h1>
                {settings.slogan && <p className="text-xs text-purple-300/70">{settings.slogan}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNotificationsClick}
              className="relative p-2 hover:bg-purple-500/20 rounded-lg transition"
            >
              <Bell className="w-5 h-5 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {(isAdmin || isClient) ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-purple-500/20 rounded-lg transition"
                >
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="hidden sm:block text-sm font-medium text-purple-200">
                    {isAdmin ? '🛡️ Admin' : clientName}
                  </span>
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-purple-500/20 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] py-2 z-50">
                      {isAdmin && (
                        <button
                          onClick={() => { onAdminPanel(); setShowUserMenu(false); }}
                          className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/10 flex items-center gap-2 text-sm"
                        >
                          <Settings className="w-4 h-4 text-purple-400" />
                          Panneau Admin
                        </button>
                      )}
                      <button
                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 btn-neon-purple text-white rounded-lg text-sm font-medium"
              >
                ✨ Connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
