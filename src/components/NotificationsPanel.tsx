import { X, Bell, CheckCheck } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationsPanel({ notifications, onClose, onMarkRead, onMarkAllRead }: NotificationsPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-end">
      <div className="bg-[#0d0d15] border-l border-purple-500/20 w-full max-w-md h-full shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-y-auto">
        <div className="p-4 bg-[#12121a] border-b border-purple-500/20 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-lg text-white text-glow-purple">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={onMarkAllRead} className="p-2 hover:bg-purple-500/10 rounded-lg transition text-xs flex items-center gap-1 text-cyan-400">
                  <CheckCheck className="w-4 h-4" />
                  Tout lire
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-purple-500/10 rounded-lg transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-purple-500/20 mx-auto mb-3" />
              <p className="text-gray-500">Aucune notification</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  notif.read
                    ? 'bg-[#12121a] border-purple-500/10'
                    : 'bg-purple-500/5 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.read && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${notif.read ? 'text-gray-400' : 'text-gray-200 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
