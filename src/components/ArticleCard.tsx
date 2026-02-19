import { ShoppingCart, Eye, Tag } from 'lucide-react';
import type { Article, BoutiqueSettings } from '../types';

interface ArticleCardProps {
  article: Article;
  settings: BoutiqueSettings;
  onOrder: (article: Article) => void;
  onView: (article: Article) => void;
}

export default function ArticleCard({ article, settings, onOrder, onView }: ArticleCardProps) {
  return (
    <div className="card-dark rounded-2xl overflow-hidden group">
      <div className="relative overflow-hidden">
        <div className="aspect-[4/5] bg-[#0d0d15]">
          {article.images?.[0] ? (
            <img
              src={article.images[0]}
              alt={article.name ?? 'Article'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1a2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%234a4a6e" font-size="12">Image</text></svg>';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-500/30">
              <Tag className="w-16 h-16" />
            </div>
          )}
        </div>

        {article.stock != null && article.stock <= 5 && article.stock > 0 && (
          <span className="absolute top-3 left-3 bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full font-medium shadow-[0_0_10px_rgba(249,115,22,0.5)]">
            ⚡ Plus que {article.stock} !
          </span>
        )}
        {article.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full font-medium shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            ❌ Épuisé
          </span>
        )}

        <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-[0_0_10px_rgba(168,85,247,0.4)]">
          {article.category ?? 'Autre'}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{article.name ?? 'Sans nom'}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{article.description ?? ''}</p>

        <div className="flex flex-wrap gap-1">
          {article.sizes?.slice(0, 4).map(size => (
            <span key={size} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
              {size}
            </span>
          ))}
          {article.sizes?.length > 4 && (
            <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
              +{article.sizes.length - 4}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {article.colors?.slice(0, 3).map(color => (
            <span key={color} className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
              {color}
            </span>
          ))}
        </div>

        <div className="pt-2 border-t border-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-400 text-lg text-glow-purple">
                {(article.priceFC ?? 0).toLocaleString()} {settings.currencyFC}
              </p>
              <p className="text-cyan-400/70 text-sm">
                {(article.priceUSD ?? 0).toLocaleString()} {settings.currencyUSD}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onView(article)}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Détails
          </button>
          <button
            onClick={() => onOrder(article)}
            disabled={article.stock === 0}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 btn-neon-purple text-white rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <ShoppingCart className="w-4 h-4" />
            Demander
          </button>
        </div>
      </div>
    </div>
  );
}
