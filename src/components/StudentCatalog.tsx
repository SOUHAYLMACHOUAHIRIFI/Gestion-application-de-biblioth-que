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
  Bookmark,
  Clock,
  AlertTriangle,
  Bell,
  BookCheck,
  MapPin
} from 'lucide-react';
import { Book, EmpruntLivre, mockBooks as defaultMockBooks } from '../types';

interface StudentCatalogProps {
  books?: Book[];
  loans?: EmpruntLivre[];
  currentStudentEmail?: string;
  currentStudentNom?: string;
  onMarkNotificationRead?: (notificationId: string) => void;
}

export default function StudentCatalog({
  books = defaultMockBooks,
  loans = [],
  currentStudentEmail = 'etudiant@usmba.ac.ma',
  currentStudentNom = 'Étudiant USMBA',
  onMarkNotificationRead,
}: StudentCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_loans'>('catalog');

  // Extraction unique des catégories existantes
  const categories = useMemo(() => {
    const list = Array.from(new Set(books.map((b) => b.categorie)));
    return ['Toutes', ...list];
  }, [books]);

  // Filtrage combiné recherche
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

  // Emprunts de l'étudiant connecté
  const myLoans = useMemo(() => {
    const targetEmail = currentStudentEmail.toLowerCase().trim();
    return loans.filter(
      (l) =>
        l.studentEmail.toLowerCase().trim() === targetEmail ||
        targetEmail.includes('etudiant') ||
        l.studentEmail.includes('etudiant')
    );
  }, [loans, currentStudentEmail]);

  // Notifications reçues pour l'étudiant
  const myNotifications = useMemo(() => {
    return myLoans.flatMap((loan) =>
      loan.notifications.map((n) => ({
        ...n,
        titreLivre: loan.titreLivre,
        dateRetourPrevueAffichee: loan.dateRetourPrevueAffichee,
        coteLivre: loan.coteLivre,
      }))
    );
  }, [myLoans]);

  const unreadNotifsCount = myNotifications.filter((n) => !n.lu).length;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Alerte si retard ou notification de la bibliothèque */}
      {unreadNotifsCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 text-xs rounded-2xl flex items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5 sm:mt-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="font-bold text-rose-900 block sm:inline">
                Alerte de la Bibliothèque Universitaire ({unreadNotifsCount} nouveau rappel) :
              </span>{' '}
              Vous avez un message de retard pour la restitution d'un ouvrage emprunté.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('my_loans')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition"
          >
            Voir mes rappels
          </button>
        </div>
      )}

      {/* Onglets Étudiant : Catalogue vs Mes Livres Empruntés */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition touch-manipulation cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catalogue Universitaire ({books.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_loans')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition touch-manipulation cursor-pointer relative ${
            activeTab === 'my_loans'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mes Livres Empruntés ({myLoans.length})</span>
          {unreadNotifsCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* ================== ONGLET 2 : MES LIVRES EMPRUNTÉS & RAPPELS ================== */}
      {activeTab === 'my_loans' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
          {/* Notifications reçues */}
          {myNotifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Notifications de retard & rappels reçus du bibliothécaire
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {myNotifications.length} message{myNotifications.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2.5">
                {myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 sm:p-4 rounded-xl border text-xs space-y-2 transition ${
                      notif.type === 'URGENT'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : notif.type === 'AVERTISSEMENT'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Rappel concernant : « {notif.titreLivre} »</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        Reçu le {notif.dateEnvoi}
                      </span>
                    </div>

                    <p className="whitespace-pre-line leading-relaxed text-slate-700 font-normal">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">
                        Date d'échéance : <strong>{notif.dateRetourPrevueAffichee}</strong>
                      </span>
                      {onMarkNotificationRead && !notif.lu && (
                        <button
                          type="button"
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des emprunts de l'étudiant enregistrés par le bibliothécaire */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Mes Ouvrages Prêtés au Guichet
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrés par le bibliothécaire avec l'horodatage exact et la date limite de restitution.
                </p>
              </div>
            </div>

            {myLoans.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <BookCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <p>Vous n'avez actuellement aucun emprunt en cours enregistré à la bibliothèque.</p>
                <p className="text-slate-500">
                  Pour emprunter un ouvrage, repérez sa cote dans le catalogue et présentez-vous au bureau du bibliothécaire.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myLoans.map((loan) => (
                  <div key={loan.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {loan.statut === 'EN_RETARD' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Retard de restitution
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Emprunt en cours
                          </span>
                        )}

                        {loan.coteLivre && (
                          <span className="font-mono text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            Cote: {loan.coteLivre}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-base text-slate-900">
                        {loan.titreLivre}
                      </h4>
                      <p className="text-xs font-mono text-slate-400">
                        ISBN : {loan.isbnLivre}
                      </p>
                    </div>

                    {/* Cadre horodatage précis */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 w-full md:w-auto shrink-0">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Date et heure exacte où le livre a été pris au guichet :
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {loan.dateEmpruntAffichee}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            À restituer avant le :
                          </span>
                          <span
                            className={`font-bold text-xs ${
                              loan.statut === 'EN_RETARD' ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            {loan.dateRetourPrevueAffichee}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================== ONGLET 1 : CATALOGUE DES LIVRES (CONSULTATION SEULE) ================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
          {/* En-tête informatif */}
          <div className="flex items-start sm:items-center gap-3 bg-indigo-50/80 border border-indigo-200/70 p-3.5 sm:p-4 rounded-xl text-indigo-950 text-xs">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="leading-relaxed">
              <span className="font-bold">Fonds Documentaire Universitaire USMBA — Consultation :</span>{' '}
              Consultez les disponibilités en rayon et les cotes. Pour emprunter un ouvrage, notez sa cote et présentez-vous au <strong>guichet du bibliothécaire</strong>.
            </div>
          </div>

          {/* Recherche & Catégories */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par titre, auteur, ISBN ou cote (ex: Algorithmes, Bishop, 978...)"
                className="w-full text-sm sm:text-xs pl-10 pr-16 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
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

          {/* Grille de cartes structurées sans image */}
          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Aucun livre trouvé</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Aucun ouvrage ne correspond à « {searchTerm} ».
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
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 active:scale-[0.99] transition duration-200 flex flex-col justify-between text-left cursor-pointer overflow-hidden"
                  title="Cliquez pour consulter la notice et les références"
                >
                  <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        {book.categorie}
                      </span>

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

                  <div className="p-4 sm:p-5 pt-3 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">ISBN</span>
                          <span className="font-mono text-slate-700 font-semibold truncate block">
                            {book.isbn}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">Cote</span>
                          <span className="font-mono text-indigo-600 font-bold truncate block">
                            {book.cote || 'BU-GEN'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:text-indigo-800">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Consulter la notice
                      </span>
                      <span className="text-slate-300">&rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal notice détaillée au clic (Consultation seule) */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 text-indigo-200 px-2.5 py-0.5 rounded-md">
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

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Numéro ISBN</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" />
                    {selectedBook.isbn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cote Rayon</span>
                  <span className="font-mono font-bold text-indigo-600 mt-0.5 block">
                    {selectedBook.cote || 'BU-GEN-01'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Maison d'édition</span>
                  <span className="font-medium text-slate-700 mt-0.5 block truncate">
                    {selectedBook.editeur || 'Dunod'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Résumé pédagogique
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedBook.description}
                </div>
              </div>

              {/* Note d'information pour le prêt physique obligatoire au guichet du bibliothécaire */}
              {selectedBook.disponible ? (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Pour emprunter cet ouvrage :</span> Rendez-vous au <strong>guichet de prêt de la bibliothèque</strong> avec votre carte d'étudiant USMBA. Le bibliothécaire enregistrera votre emprunt avec la cote <code className="font-mono font-bold bg-white text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">{selectedBook.cote || 'BU-GEN-01'}</code>.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Ouvrage en cours de prêt :</span> Ce manuel est actuellement emprunté par un autre étudiant. Vous pourrez l'emprunter auprès du bibliothécaire dès sa restitution.
                  </div>
                </div>
              )}

              {/* Bouton de fermeture uniquement */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition cursor-pointer"
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
