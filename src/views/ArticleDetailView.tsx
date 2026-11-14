import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, User, Share2, Check, Tag, Sparkles, BookOpen, ArrowRight, Quote } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { Article } from '../types';

interface ArticleDetailViewProps {
  slug: string;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  slug,
  onBack,
  onSelectArticle
}) => {
  const { publishedArticles: articles } = useAppData();
  const [shareFeedback, setShareFeedback] = useState(false);

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Artikel Tidak Ditemukan</h2>
        <p className="text-stone-600 text-sm">
          Artikel atau opini teknologi yang Anda cari tidak tersedia dalam direktori.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Kembali ke Daftar Artikel
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2500);
  };

  const otherArticles = articles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
      {/* Back button and share */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-950 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Semua Artikel</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors cursor-pointer"
        >
          {shareFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Tautan Tersalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Artikel</span>
            </>
          )}
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-3">
        {/* Unboxed Meta Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
          <span className="font-semibold text-stone-900 uppercase tracking-wide">
            {article.category}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            {article.publishedDate}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {article.readTimeMinutes} menit baca
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-stone-400" />
            {article.author}
          </span>

          {article.isAiGenerated && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#65a30d]">
                <Sparkles className="w-3 h-3" />
                Dibuat dengan Bantuan AI
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Summary Lead */}
        <div className="p-3.5 bg-stone-100/80 rounded-xl border-l-4 border-stone-800 text-stone-700 text-sm sm:text-base leading-relaxed italic">
          {article.summary}
        </div>
      </header>

      {/* Hero Thumbnail */}
      {article.thumbnail && (
        <div className="rounded-xl overflow-hidden border border-stone-200 max-h-[340px] bg-stone-100 shadow-xs">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Article Body Content */}
      <article className="space-y-5 sm:space-y-6 text-stone-800 leading-relaxed text-sm sm:text-base">
        {article.sections.map((section, index) => (
          <section key={index} className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-stone-950 tracking-tight border-b border-stone-100 pb-1.5">
              {section.heading}
            </h2>
            <p className="text-stone-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {section.body}
            </p>

            {section.highlight && (
              <div className="my-3 p-3.5 bg-white rounded-lg border border-stone-200 border-l-4 border-l-[#84cc16] shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Quote className="w-4 h-4 text-[#84cc16] shrink-0 mt-0.5" />
                  <p className="text-stone-800 font-medium italic text-xs sm:text-sm">
                    "{section.highlight}"
                  </p>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Conclusion Block */}
        {article.conclusion && (
          <div className="p-4 sm:p-5 bg-stone-900 text-white rounded-xl space-y-1.5 mt-5">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#84cc16]">
              KESIMPULAN & RINGKASAN INTISARI
            </div>
            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
              {article.conclusion}
            </p>
          </div>
        )}
      </article>

      {/* Tags */}
      <div className="pt-4 border-t border-stone-200 space-y-1.5">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
          Topik Terkait
        </span>
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-2xs"
            >
              <Tag className="w-3 h-3 text-stone-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Author Card */}
      <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-base shrink-0">
          {article.author.charAt(0)}
        </div>
        <div>
          <div className="text-[11px] text-stone-500 font-medium">Ditulis & Divalidasi Oleh</div>
          <div className="text-sm font-bold text-stone-950">{article.author}</div>
          <p className="text-xs text-stone-600 mt-0.5">
            Praktisi IT Support & Web Developer yang mengkaji adopsi teknologi cerdas dan pemeliharaan sistem komputer.
          </p>
        </div>
      </div>

      {/* Other Recommended Articles */}
      {otherArticles.length > 0 && (
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-950">Artikel Lainnya yang Mungkin Anda Suka</h3>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-stone-600 hover:text-stone-950 inline-flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {otherArticles.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectArticle(item.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group bg-white p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 transition-all cursor-pointer shadow-2xs flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500">
                    {item.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-stone-700 line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                <div className="text-[11px] font-medium text-stone-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Baca Artikel
                  <ArrowRight className="w-3 h-3 text-[#65a30d]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
