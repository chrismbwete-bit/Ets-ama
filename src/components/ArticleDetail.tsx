import { X, ShoppingCart, Tag, Package, Palette } from 'lucide-react';
import type { Article, BoutiqueSettings } from '../types';

interface ArticleDetailProps {
  article: Article;
  settings: BoutiqueSettings;
  onClose: () => void;
  onOrder: (article: Article) => void;
}

export function ArticleDetail({ article, settings, onClose, onOrder }: ArticleDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-purple-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <div className="relative">
          <div className="aspect-video bg-[#0a0a0f]">
            {article.images[0] ? (
              <img
                src={article.images[0]}
                alt={article.name}
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1a2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%234a4a6e" font-size="12">Image</text></svg>';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-500/30">
                <Tag className="w-20 h-20" />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-black/80 transition border border-purple-500/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <span className="absolute bottom-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            {article.category}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white text-glow-purple">{article.name}</h2>
          <p className="text-gray-400 leading-relaxed">{article.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-purple-400 font-medium">Prix en {settings.currencyFC}</p>
              <p className="text-2xl font-bold text-purple-300 text-glow-purple">{article.priceFC.toLocaleString()} {settings.currencyFC}</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm text-cyan-400 font-medium">Prix en {settings.currencyUSD}</p>
              <p className="text-2xl font-bold text-cyan-300 text-glow-cyan">{article.priceUSD.toLocaleString()} {settings.currencyUSD}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Tailles disponibles:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.sizes.map(size => (
                <span key={size} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm font-medium text-purple-300">
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Couleurs disponibles:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.colors.map(color => (
                <span key={color} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-sm font-medium">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-purple-500/10">
            <div>
              <span className={`text-sm font-medium ${article.stock > 5 ? 'text-green-400 text-glow-green' : article.stock > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                {article.stock > 5 ? '✅ En stock' : article.stock > 0 ? `⚡ Plus que ${article.stock} en stock` : '❌ Épuisé'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onOrder(article)}
            disabled={article.stock === 0}
            className="w-full flex items-center justify-center gap-2 py-3 btn-neon-purple text-white rounded-xl font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <ShoppingCart className="w-5 h-5" />
            ✨ Demander cet article
          </button>
        </div>
      </div>
    </div>
  );
}
