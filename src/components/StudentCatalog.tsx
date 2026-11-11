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
  Info,
  Calendar,
  Building2,
  Bookmark
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

  // Filtrage combiné recherche (titre, auteur, ISBN, cote) + catégorie
  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        query === '' ||
        book.titre.toLowerCase().includes(query) ||
        book.auteur.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        (book.cote && book.cote.toLowerCase().includes(query)) ||
        (book.editeur && book.editeur.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'Toutes' || book.categorie === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* En-tête informatif mode consultation */}
      <div className="flex items-start sm:items-center gap-3 bg-indigo-50/80 border border-indigo-200/70 p-3.5 sm:p-4 rounded-xl text-indigo-950 text-xs">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Fonds Documentaire USMBA — Consultation libre :</span>{' '}
          Explorez les ouvrages académiques réels répertoriés à la bibliothèque. Cliquez sur une fiche pour afficher la notice bibliographique détaillée.
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
            placeholder="Rechercher par titre, auteur, ISBN ou cote (ex: Algorithmes, Bishop, 978...)"
            className="w-full text-sm sm:text-xs pl-10 pr-16 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filtres par catégorie avec défilement tactile fluide */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs pb-1 scrollbar-none">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5" /> Disciplines :
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition touch-manipulation cursor-pointer ${
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

      {/* Grille de fiches bibliographiques structurées (sans image) */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Aucun livre trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aucun ouvrage ne correspond à votre recherche « {searchTerm} ». Modifiez vos termes de recherche ou la discipline sélectionnée.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
              className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 active:scale-[0.99] transition duration-200 flex flex-col justify-between text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 overflow-hidden"
              title="Cliquez pour consulter la notice complète"
            >
              {/* En-tête de la fiche bibliographique */}
              <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    {book.categorie}
                  </span>

                  {/* Badge Disponibilité */}
                  {book.disponible ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      Emprunté
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                  {book.titre}
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {book.auteur}
                </p>
              </div>

              {/* Métadonnées structurées de l'ouvrage */}
              <div className="p-4 sm:p-5 pt-3 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* Grille des caractéristiques */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">ISBN</span>
                      <span className="font-mono text-slate-700 font-semibold truncate block">
                        {book.isbn}
                      </span>
                    </div>

                    {book.cote ? (
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Cote Rayon</span>
                        <span className="font-mono text-indigo-600 font-bold truncate block">
                          {book.cote}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Éditeur</span>
                        <span className="text-slate-700 font-medium truncate block">
                          {book.editeur || 'Universitaire'}
                        </span>
                      </div>
                    )}

                    {book.editeur && book.cote && (
                      <div className="col-span-2 flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {book.editeur}
                        </span>
                        {book.annee && (
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {book.annee}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Résumé textuel */}
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Bouton de consultation de la notice */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:text-indigo-800">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Consulter la notice complète
                  </span>
                  <span className="text-slate-300 group-hover:translate-x-0.5 transition">&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal notice détaillée au clic (sans image, structure académique) */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal académique */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Fermer la notice"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 text-indigo-200 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                  <Layers className="w-3 h-3 text-indigo-300" />
                  {selectedBook.categorie}
                </span>

                {selectedBook.disponible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Disponible en rayon
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/90 text-white shadow-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    Actuellement emprunté
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold leading-snug text-white pr-8">
                {selectedBook.titre}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 font-medium">
                Auteur(s) : {selectedBook.auteur}
              </p>
            </div>

            {/* Corps de la fiche structurée */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Tableau de spécifications bibliographiques */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  Fiche Technique & Références
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Numéro ISBN</span>
                    <span className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Barcode className="w-3.5 h-3.5 text-slate-400" />
                      {selectedBook.isbn}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Cote de classement</span>
                    <span className="font-mono font-bold text-indigo-600 mt-0.5 block">
                      {selectedBook.cote || 'BU-GEN-01'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Discipline</span>
                    <span className="font-medium text-slate-700 mt-0.5 block truncate">
                      {selectedBook.categorie}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Maison d'édition</span>
                    <span className="font-medium text-slate-700 mt-0.5 block truncate">
                      {selectedBook.editeur || 'Éditions Universitaires'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Année d'édition</span>
                    <span className="font-medium text-slate-700 mt-0.5 block">
                      {selectedBook.annee || 'Édition récente'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Statut</span>
                    <span className={`font-semibold mt-0.5 block ${selectedBook.disponible ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {selectedBook.disponible ? '🟢 En rayon' : '🔴 En prêt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Résumé / Description */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Résumé et contenu pédagogique
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedBook.description}
                </div>
              </div>

              {/* Bouton de fermeture */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
                >
                  Fermer la notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
