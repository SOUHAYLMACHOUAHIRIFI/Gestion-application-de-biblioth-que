import { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle2,
  XCircle,
  Tag,
  Barcode,
  Layers,
  X,
  Eye,
  Info
} from 'lucide-react';
import { Book, mockBooks as defaultMockBooks } from '../types';

interface StudentCatalogProps {
  books?: Book[];
}

export default function StudentCatalog({ books = defaultMockBooks }: StudentCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Extraction unique des catégories existantes
  const categories = useMemo(() => {
    const list = Array.from(new Set(books.map((b) => b.categorie)));
    return ['Toutes', ...list];
  }, [books]);

  // Filtrage combiné recherche (titre, auteur, ISBN) + catégorie
  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        query === '' ||
        book.titre.toLowerCase().includes(query) ||
        book.auteur.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'Toutes' || book.categorie === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* En-tête informatif mode consultation */}
      <div className="flex items-start sm:items-center gap-3 bg-blue-50/80 border border-blue-200/70 p-3.5 sm:p-4 rounded-xl text-blue-900 text-xs">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="leading-relaxed">
          <span className="font-semibold">Catalogue Étudiant — Consultation libre :</span>{' '}
          Recherchez par mots-clés ou ISBN et touchez une carte pour consulter le résumé complet.
        </div>
      </div>

      {/* Barre de recherche et filtres de catégorie */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
        {/* Champ de recherche */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, auteur ou ISBN..."
            className="w-full text-sm sm:text-xs pl-10 pr-16 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filtres par catégorie avec défilement tactile fluide */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs pb-1 scrollbar-none">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5" /> Catégories :
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {categories.map((cat) => {
              const count =
                cat === 'Toutes'
                  ? books.length
                  : books.filter((b) => b.categorie === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition touch-manipulation ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grille de cartes (1 colonne sur mobile, 2 sur tablette, 3 sur grand écran) */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Aucun résultat trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aucun livre ne correspond à votre recherche « {searchTerm} ». Modifiez vos filtres pour relancer la recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBook(book);
                }
              }}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 active:scale-[0.99] transition duration-200 flex flex-col overflow-hidden text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 touch-manipulation"
              title="Cliquez pour afficher la description complète"
            >
              {/* Image de couverture & badges */}
              <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden">
                <img
                  src={book.couvertureUrl}
                  alt={book.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-black/10" />

                {/* Badge Disponibilité (🟢 / 🔴) */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                  {book.disponible ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      🟢 Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-md backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-rose-200" />
                      🔴 Indisponible
                    </span>
                  )}
                </div>

                {/* Catégorie */}
                <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/95 text-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-xs backdrop-blur-md">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    {book.categorie}
                  </span>
                </div>
              </div>

              {/* Contenu carte */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Barcode className="w-3 h-3" />
                    <span>{book.isbn}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {book.titre}
                  </h3>

                  <p className="text-xs font-semibold text-slate-600">
                    Auteur : <span className="text-indigo-600">{book.auteur}</span>
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                    {book.description}
                  </p>
                </div>

                {/* Bouton de lecture seule */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:underline">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Lire la description complète
                  </span>
                  <span className="text-slate-300 font-light">&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal description complète au clic (Adaptée mobile) */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image et bouton fermer */}
            <div className="relative h-52 sm:h-64 bg-slate-100 shrink-0">
              <img
                src={selectedBook.couvertureUrl}
                alt={selectedBook.titre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 active:scale-95 transition touch-manipulation"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badges dans l'image du modal */}
              <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/95 text-slate-900 px-2.5 py-1 rounded-md backdrop-blur-md">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  {selectedBook.categorie}
                </span>

                {selectedBook.disponible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    🟢 Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    🔴 Indisponible
                  </span>
                )}
              </div>
            </div>

            {/* Détails du livre */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                  <Barcode className="w-3.5 h-3.5" />
                  <span>ISBN : {selectedBook.isbn}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedBook.titre}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-indigo-600 mt-1">
                  Auteur : {selectedBook.auteur}
                </p>
              </div>

              {/* Bloc description complète */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Description de l'ouvrage
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
                  {selectedBook.description}
                </div>
              </div>

              {/* Bouton fermeture tactile */}
              <div className="pt-2 sm:pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition touch-manipulation"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
