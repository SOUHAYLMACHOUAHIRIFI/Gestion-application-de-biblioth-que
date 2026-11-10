import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  ScanBarcode,
  PenTool,
  Check,
  X,
  Layers,
  Barcode,
  Sparkles,
  AlertCircle,
  Camera,
  RefreshCw
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Book, mockBooks as defaultMockBooks } from '../types';

interface ManagerDashboardProps {
  books?: Book[];
  onBooksChange?: (books: Book[]) => void;
}

export default function ManagerDashboard({
  books: initialBooks = defaultMockBooks,
  onBooksChange,
}: ManagerDashboardProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // État de la modal d'ajout
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'scan' | 'manual'>('scan');

  // État de la modal d'édition
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Formulaire d'ajout / édition
  const [formIsbn, setFormIsbn] = useState('');
  const [formTitre, setFormTitre] = useState('');
  const [formAuteur, setFormAuteur] = useState('');
  const [formCategorie, setFormCategorie] = useState('Littérature');
  const [formCouvertureUrl, setFormCouvertureUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisponible, setFormDisponible] = useState(true);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Référence au scanner html5-qrcode
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Synchronisation avec les props
  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  const updateBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    if (onBooksChange) {
      onBooksChange(newBooks);
    }
  };

  // Toggle switch à un clic pour basculer le statut disponible (true/false)
  const handleToggleDisponible = (id: string) => {
    const updated = books.map((b) =>
      b.id === id ? { ...b, disponible: !b.disponible } : b
    );
    updateBooks(updated);
  };

  // Suppression d'un livre
  const handleDeleteBook = (id: string, titre: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'ouvrage "${titre}" de la bibliothèque ?`)) {
      const updated = books.filter((b) => b.id !== id);
      updateBooks(updated);
    }
  };

  // Initialisation du scanner QR/Barcode lorsque l'onglet "scan" est actif dans la modale
  useEffect(() => {
    if (!isAddModalOpen || addTab !== 'scan') {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch {
          // ignore cleanup errors
        }
        scannerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const element = document.getElementById('reader');
      if (!element) return;

      try {
        const scanner = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [],
          },
          false
        );

        scanner.render(
          (decodedText) => {
            // Scan réussi : remplissage automatique de l'ISBN
            setFormIsbn(decodedText);
            setScanMessage(`Code ISBN scanné avec succès : ${decodedText}`);
            // Bascule automatique vers l'onglet saisie manuelle pour compléter le titre
            setTimeout(() => {
              setAddTab('manual');
            }, 900);
          },
          () => {
            // Scan en cours / non détecté
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.warn('Impossible d\'initialiser le scanner de caméra :', err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }
    };
  }, [isAddModalOpen, addTab]);

  // Ouverture modal d'ajout
  const handleOpenAddModal = () => {
    setFormIsbn('');
    setFormTitre('');
    setFormAuteur('');
    setFormCategorie('Littérature');
    setFormCouvertureUrl('');
    setFormDescription('');
    setFormDisponible(true);
    setScanMessage(null);
    setFormError(null);
    setAddTab('scan');
    setIsAddModalOpen(true);
  };

  // Soumission du formulaire d'ajout
  const handleSaveNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitre.trim() || !formAuteur.trim()) {
      setFormError('Le titre et l\'auteur sont obligatoires.');
      return;
    }

    const newBook: Book = {
      id: `b_${Date.now()}`,
      isbn: formIsbn.trim() || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      titre: formTitre.trim(),
      auteur: formAuteur.trim(),
      categorie: formCategorie.trim() || 'Général',
      couvertureUrl:
        formCouvertureUrl.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      disponible: formDisponible,
      description: formDescription.trim() || 'Aucune description disponible pour cet ouvrage.',
    };

    updateBooks([newBook, ...books]);
    setIsAddModalOpen(false);
  };

  // Ouverture modal d'édition
  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormIsbn(book.isbn);
    setFormTitre(book.titre);
    setFormAuteur(book.auteur);
    setFormCategorie(book.categorie);
    setFormCouvertureUrl(book.couvertureUrl);
    setFormDescription(book.description);
    setFormDisponible(book.disponible);
    setFormError(null);
  };

  // Sauvegarde des modifications d'un livre
  const handleSaveEditBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!formTitre.trim() || !formAuteur.trim()) {
      setFormError('Le titre et l\'auteur sont obligatoires.');
      return;
    }

    const updated = books.map((b) =>
      b.id === editingBook.id
        ? {
            ...b,
            isbn: formIsbn.trim(),
            titre: formTitre.trim(),
            auteur: formAuteur.trim(),
            categorie: formCategorie.trim(),
            couvertureUrl: formCouvertureUrl.trim(),
            description: formDescription.trim(),
            disponible: formDisponible,
          }
        : b
    );

    updateBooks(updated);
    setEditingBook(null);
  };

  // Simulation d'un scan ISBN (utile si pas de webcam connectée dans l'iframe)
  const handleSimulateScan = (isbnSample: string) => {
    setFormIsbn(isbnSample);
    setScanMessage(`Code ISBN scanné : ${isbnSample}`);
    setTimeout(() => {
      setAddTab('manual');
    }, 700);
  };

  // Liste des catégories pour le filtrage
  const categories = ['Toutes', ...Array.from(new Set(books.map((b) => b.categorie)))];

  // Filtrage
  const filteredBooks = books.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      b.titre.toLowerCase().includes(q) ||
      b.auteur.toLowerCase().includes(q) ||
      b.isbn.includes(q);
    const matchesCategory =
      selectedCategory === 'Toutes' || b.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-6">
      {/* Barre d'action supérieure */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer les ouvrages par titre, auteur ou ISBN..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un livre</span>
          </button>
        </div>
      </div>

      {/* Tableau d'administration des livres */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Inventaire & Contrôle des Disponibilités
            </h3>
            <p className="text-xs text-slate-500">
              {filteredBooks.length} ouvrage{filteredBooks.length > 1 ? 's' : ''} répertorié{filteredBooks.length > 1 ? 's' : ''} • Basculez la disponibilité en 1 clic
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            Mode Gestionnaire
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Livre & ISBN</th>
                <th className="py-3 px-4">Auteur</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-center">Disponibilité (1-Clic)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Aucun livre ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition">
                    {/* Colonne Livre */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.couvertureUrl}
                          alt={book.titre}
                          className="w-10 h-14 object-cover rounded-md border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="font-bold text-slate-900 truncate" title={book.titre}>
                            {book.titre}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                            <Barcode className="w-3 h-3" />
                            {book.isbn}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Auteur */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {book.auteur}
                    </td>

                    {/* Catégorie */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Layers className="w-3 h-3" />
                        {book.categorie}
                      </span>
                    </td>

                    {/* Toggle Switch à 1-clic pour basculer le statut disponible */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleDisponible(book.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            book.disponible ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          role="switch"
                          aria-checked={book.disponible}
                          title="Cliquez pour changer la disponibilité"
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              book.disponible ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-semibold ${
                            book.disponible ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {book.disponible ? 'Disponible' : 'Emprunté'}
                        </span>
                      </div>
                    </td>

                    {/* Actions d'édition et suppression */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Éditer le livre"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.titre)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Supprimer le livre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal "Ajouter un livre" avec les 2 onglets (Scan ISBN / Saisie manuelle) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ajouter un nouveau livre</h3>
                  <p className="text-xs text-slate-500">Scan code-barres ISBN ou saisie des détails</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets (Scan ISBN vs Saisie manuelle) */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddTab('scan')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition ${
                  addTab === 'scan'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ScanBarcode className="w-4 h-4 text-indigo-600" />
                <span>1. Scan ISBN</span>
              </button>

              <button
                type="button"
                onClick={() => setAddTab('manual')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition ${
                  addTab === 'manual'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span>2. Saisie manuelle</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Onglet 1: Scan ISBN via html5-qrcode */}
              {addTab === 'scan' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 leading-relaxed bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      Placez le code-barres ISBN de votre livre devant la caméra. La détection remplira automatiquement le champ ISBN pour l'enregistrement.
                    </div>
                  </div>

                  {/* Zone de scan camera gérée par html5-qrcode */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white min-h-[220px] flex items-center justify-center p-2">
                    <div id="reader" className="w-full text-slate-900" />
                  </div>

                  {scanMessage && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{scanMessage}</span>
                    </div>
                  )}

                  {/* Boutons de simulation de scan (très pratique si la caméra n'est pas autorisée dans l'iframe) */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 mb-2">
                      Ou tester avec un exemple de code ISBN :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateScan('978-2070360024')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-[11px] font-mono transition"
                      >
                        978-2070360024 (Camus)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateScan('978-0132350884')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-[11px] font-mono transition"
                      >
                        978-0132350884 (Clean Code)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateScan('978-2253006329')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-[11px] font-mono transition"
                      >
                        978-2253006329 (1984)
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setAddTab('manual')}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
                    >
                      Continuer vers la saisie manuelle &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet 2: Saisie manuelle */}
              {addTab === 'manual' && (
                <form onSubmit={handleSaveNewBook} className="space-y-3">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Numéro ISBN {formIsbn && <span className="text-emerald-600 font-normal">(Scanné)</span>}
                      </label>
                      <div className="relative">
                        <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={formIsbn}
                          onChange={(e) => setFormIsbn(e.target.value)}
                          placeholder="Ex: 978-2070360024"
                          className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Titre de l'ouvrage *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitre}
                        onChange={(e) => setFormTitre(e.target.value)}
                        placeholder="Ex: Les Misérables"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Auteur *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAuteur}
                        onChange={(e) => setFormAuteur(e.target.value)}
                        placeholder="Victor Hugo"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        value={formCategorie}
                        onChange={(e) => setFormCategorie(e.target.value)}
                        placeholder="Roman classique"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        URL de la couverture
                      </label>
                      <input
                        type="url"
                        value={formCouvertureUrl}
                        onChange={(e) => setFormCouvertureUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Description / Résumé
                      </label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Présentation de l'ouvrage..."
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-semibold text-slate-700">Disponible immédiatement ?</span>
                      <button
                        type="button"
                        onClick={() => setFormDisponible(!formDisponible)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          formDisponible ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                            formDisponible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setAddTab('scan')}
                      className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                    >
                      &larr; Retour Scan
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
                    >
                      Enregistrer le livre
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal "Édition d'un livre" */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Modifier le livre</h3>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBook} className="space-y-3">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Auteur *</label>
                  <input
                    type="text"
                    required
                    value={formAuteur}
                    onChange={(e) => setFormAuteur(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN</label>
                <input
                  type="text"
                  value={formIsbn}
                  onChange={(e) => setFormIsbn(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Couverture</label>
                <input
                  type="url"
                  value={formCouvertureUrl}
                  onChange={(e) => setFormCouvertureUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Statut disponible</span>
                <button
                  type="button"
                  onClick={() => setFormDisponible(!formDisponible)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    formDisponible ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      formDisponible ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="flex-1 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
