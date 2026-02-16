import { X, MessageCircle, ExternalLink } from 'lucide-react';
import type { Article, BoutiqueSettings, Client } from '../types';

interface OrderModalProps {
  article: Article;
  settings: BoutiqueSettings;
  client: Client | null;
  onClose: () => void;
  onNeedLogin: () => void;
  onOrderPlaced: (article: Article) => void;
}

export function OrderModal({ article, settings, client, onClose, onNeedLogin, onOrderPlaced }: OrderModalProps) {
  if (!client) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#12121a] border border-purple-500/20 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(168,85,247,0.15)] p-6 text-center">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <MessageCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white text-glow-purple mb-2">Connexion requise</h3>
          <p className="text-gray-400 mb-6">
            Pour commander <strong className="text-purple-300">{article.name}</strong>, vous devez d'abord vous connecter.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-purple-500/20 text-gray-400 rounded-xl font-medium hover:bg-purple-500/5 transition">
              Annuler
            </button>
            <button onClick={() => { onClose(); onNeedLogin(); }} className="flex-1 py-3 btn-neon-purple text-white rounded-xl font-bold">
              ✨ Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `🛍️ *DEMANDE D'ARTICLE*\n\n` +
    `📦 Article: ${article.name}\n` +
    `💰 Prix: ${article.priceFC.toLocaleString()} FC / ${article.priceUSD} USD\n` +
    `📏 Catégorie: ${article.category}\n` +
    `🎨 Couleurs: ${article.colors.join(', ')}\n` +
    `📐 Tailles: ${article.sizes.join(', ')}\n\n` +
    `👤 Client: ${client.firstName} ${client.lastName}\n` +
    `📱 Téléphone: ${client.phone}\n\n` +
    `Je souhaite commander cet article. Merci !`
  );

  const whatsappUrl = settings.whatsappGroupLink
    ? settings.whatsappGroupLink
    : settings.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`
      : `https://wa.me/?text=${whatsappMessage}`;

  const handleOrder = () => {
    onOrderPlaced(article);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-purple-500/20 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white text-glow-purple">Confirmer la demande</h3>
            <button onClick={onClose} className="p-2 hover:bg-purple-500/10 rounded-full transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
            <div className="flex gap-3">
              {article.images[0] && (
                <img src={article.images[0]} alt={article.name} className="w-20 h-20 rounded-lg object-cover border border-purple-500/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div>
                <h4 className="font-bold text-white">{article.name}</h4>
                <p className="text-purple-300 font-bold">{article.priceFC.toLocaleString()} {settings.currencyFC}</p>
                <p className="text-cyan-400/70 text-sm">{article.priceUSD} {settings.currencyUSD}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d15] border border-purple-500/10 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-purple-300 mb-2">Vos informations:</p>
            <p className="text-sm text-gray-400">👤 {client.firstName} {client.lastName}</p>
            <p className="text-sm text-gray-400">📱 {client.phone}</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-400">
              <strong>📱 WhatsApp:</strong> Vous serez redirigé vers WhatsApp pour confirmer votre commande.
            </p>
          </div>

          <button
            onClick={handleOrder}
            className="w-full flex items-center justify-center gap-2 py-3 btn-neon-green text-white rounded-xl font-bold text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            ✨ Envoyer la demande
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
