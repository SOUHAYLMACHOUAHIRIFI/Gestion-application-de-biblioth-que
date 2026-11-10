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
    <div className="w-full space-y-6">
      {/* En-tête informatif mode consultation */}
      <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200/70 p-4 rounded-xl text-blue-900 text-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <span className="font-semibold">Catalogue Étudiant — Consultation libre :</span>{' '}
          Parcourez les ouvrages référencés, recherchez par mots-clés ou ISBN et cliquez sur une carte pour lire le résumé complet.
        </div>
      </div>

      {/* Barre de recherche et filtres de catégorie */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Champ de recherche */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un ouvrage par titre, auteur ou numéro ISBN..."
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filtres par catégorie */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grille de cartes (Lecture Seule Stricte) */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-700">Aucun résultat trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aucun livre ne correspond à votre recherche « {searchTerm} ». Modifiez vos filtres pour relancer la recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 transition duration-200 flex flex-col overflow-hidden text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              title="Cliquez pour afficher la description complète"
            >
              {/* Image de couverture & badges */}
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img
                  src={book.couvertureUrl}
                  alt={book.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/10" />

                {/* Badge Disponibilité (🟢 Disponible / 🔴 Indisponible) */}
                <div className="absolute top-3 right-3">
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
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/95 text-slate-800 px-2.5 py-1 rounded-md shadow-xs backdrop-blur-md">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    {book.categorie}
                  </span>
                </div>
              </div>

              {/* Contenu carte */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
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

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                    {book.description}
                  </p>
                </div>

                {/* Indication clic pour détails (Strictement aucun bouton d'emprunt ou d'édition) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:underline">
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

      {/* Modal description complète au clic (LECTURE SEULE STRICTE) */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image et bouton fermer */}
            <div className="relative h-64 bg-slate-100 shrink-0">
              <img
                src={selectedBook.couvertureUrl}
                alt={selectedBook.titre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badges dans l'image du modal */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/90 text-slate-900 px-2.5 py-1 rounded-md backdrop-blur-md">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  {selectedBook.categorie}
                </span>

                {selectedBook.disponible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    🟢 Disponible en rayon
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    🔴 Actuellement indisponible
                  </span>
                )}
              </div>
            </div>

            {/* Détails du livre */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                  <Barcode className="w-3.5 h-3.5" />
                  <span>ISBN : {selectedBook.isbn}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedBook.titre}
                </h2>
                <p className="text-sm font-semibold text-indigo-600 mt-1">
                  Auteur : {selectedBook.auteur}
                </p>
              </div>

              {/* Bloc description complète */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description de l'ouvrage
                </h4>
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedBook.description}
                </div>
              </div>

              {/* Bouton fermeture uniquement (AUCUN bouton d'emprunt ni d'édition) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="px-5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
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
