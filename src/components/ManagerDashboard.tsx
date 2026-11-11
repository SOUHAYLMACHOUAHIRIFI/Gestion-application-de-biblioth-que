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
  AlertCircle,
  Camera,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  BookOpen,
  Bookmark,
  Building2,
  Calendar
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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

  // État du scanner
  const [cameraStatus, setCameraStatus] = useState<'starting' | 'active' | 'error' | 'success'>('starting');
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);

  // État de la modal d'édition
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Formulaire d'ajout / édition
  const [formIsbn, setFormIsbn] = useState('');
  const [formTitre, setFormTitre] = useState('');
  const [formAuteur, setFormAuteur] = useState('');
  const [formCategorie, setFormCategorie] = useState('Informatique & Algorithmique');
  const [formCote, setFormCote] = useState('');
  const [formEditeur, setFormEditeur] = useState('');
  const [formAnnee, setFormAnnee] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisponible, setFormDisponible] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Référence d'instance au scanner
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (window.confirm(`Êtes-vous certain de vouloir retirer l'ouvrage "${titre}" de l'inventaire ?`)) {
      const updated = books.filter((b) => b.id !== id);
      updateBooks(updated);
    }
  };

  // Gestion du succès du scan
  const handleScanSuccess = (decodedText: string) => {
    const cleanedText = decodedText.trim();
    setFormIsbn(cleanedText);
    setCameraStatus('success');

    stopCamera();

    setTimeout(() => {
      setAddTab('manual');
    }, 1000);
  };

  // Arrêt sécurisé de la caméra
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Erreur lors de l'arrêt du scanner :", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

  // Démarrage de la caméra
  const startCamera = async () => {
    await stopCamera();

    const element = document.getElementById('reader');
    if (!element) return;

    setCameraStatus('starting');
    setCameraErrorMessage(null);

    try {
      const qrCode = new Html5Qrcode('reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = qrCode;

      const config = {
        fps: 15,
        qrbox: { width: 240, height: 150 },
        aspectRatio: 1.777778,
      };

      await qrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );

      setCameraStatus('active');
    } catch (err: unknown) {
      console.error('Erreur démarrage caméra :', err);
      setCameraStatus('error');
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes('NotAllowedError') || errStr.includes('Permission')) {
        setCameraErrorMessage('Accès caméra refusé. Autorisez la caméra ou saisissez le code ISBN.');
      } else if (errStr.includes('NotFoundError') || errStr.includes('DevicesNotFoundError')) {
        setCameraErrorMessage('Aucune webcam détectée sur cet appareil. Utilisez la saisie manuelle.');
      } else {
        setCameraErrorMessage("Impossible d'activer la vidéo. Utilisez la saisie manuelle ou l'import d'image.");
      }
    }
  };

  // Scan d'un fichier image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await stopCamera();
      const qrCode = new Html5Qrcode('reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
      html5QrCodeRef.current = qrCode;

      const result = await qrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      console.warn('Erreur lecture image code-barres :', err);
      setCameraErrorMessage('Aucun code-barres lisible trouvé dans cette image. Réessayez avec une photo plus nette.');
    }
  };

  // Cycle de vie : gérer le démarrage et l'arrêt de la caméra
  useEffect(() => {
    if (isAddModalOpen && addTab === 'scan') {
      const timer = setTimeout(() => {
        startCamera();
      }, 250);

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isAddModalOpen, addTab]);

  // Ouverture modal d'ajout
  const handleOpenAddModal = () => {
    setFormIsbn('');
    setFormTitre('');
    setFormAuteur('');
    setFormCategorie('Informatique & Algorithmique');
    setFormCote('');
    setFormEditeur('');
    setFormAnnee(new Date().getFullYear().toString());
    setFormDescription('');
    setFormDisponible(true);
    setFormError(null);
    setCameraStatus('starting');
    setCameraErrorMessage(null);
    setAddTab('scan');
    setIsAddModalOpen(true);
  };

  // Fermeture modal d'ajout
  const handleCloseAddModal = () => {
    stopCamera();
    setIsAddModalOpen(false);
  };

  // Soumission du formulaire d'ajout
  const handleSaveNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitre.trim() || !formAuteur.trim()) {
      setFormError("Le titre et l'auteur sont obligatoires.");
      return;
    }

    const newBook: Book = {
      id: `b_${Date.now()}`,
      isbn: formIsbn.trim() || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      titre: formTitre.trim(),
      auteur: formAuteur.trim(),
      categorie: formCategorie.trim() || 'Général',
      cote: formCote.trim() || undefined,
      editeur: formEditeur.trim() || undefined,
      annee: formAnnee ? parseInt(formAnnee, 10) : undefined,
      disponible: formDisponible,
      description: formDescription.trim() || 'Notice bibliographique enregistrée sans résumé détaillé.',
    };

    updateBooks([newBook, ...books]);
    handleCloseAddModal();
  };

  // Ouverture modal d'édition
  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormIsbn(book.isbn);
    setFormTitre(book.titre);
    setFormAuteur(book.auteur);
    setFormCategorie(book.categorie);
    setFormCote(book.cote || '');
    setFormEditeur(book.editeur || '');
    setFormAnnee(book.annee ? book.annee.toString() : '');
    setFormDescription(book.description);
    setFormDisponible(book.disponible);
    setFormError(null);
  };

  // Sauvegarde des modifications d'un livre
  const handleSaveEditBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!formTitre.trim() || !formAuteur.trim()) {
      setFormError("Le titre et l'auteur sont obligatoires.");
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
            cote: formCote.trim() || undefined,
            editeur: formEditeur.trim() || undefined,
            annee: formAnnee ? parseInt(formAnnee, 10) : undefined,
            description: formDescription.trim(),
            disponible: formDisponible,
          }
        : b
    );

    updateBooks(updated);
    setEditingBook(null);
  };

  const handleSimulateScan = (isbnSample: string) => {
    handleScanSuccess(isbnSample);
  };

  const categories = ['Toutes', ...Array.from(new Set(books.map((b) => b.categorie)))];

  const filteredBooks = books.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      b.titre.toLowerCase().includes(q) ||
      b.auteur.toLowerCase().includes(q) ||
      b.isbn.includes(q) ||
      (b.cote && b.cote.toLowerCase().includes(q));
    const matchesCategory =
      selectedCategory === 'Toutes' || b.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Barre d'action supérieure */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, auteur, ISBN ou cote de rangement..."
            className="w-full text-sm sm:text-xs pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none text-xs py-3 sm:py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium touch-manipulation cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95 shrink-0 touch-manipulation cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un ouvrage</span>
          </button>
        </div>
      </div>

      {/* Conteneur Inventaire structuré (sans image) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Titre du bloc */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Inventaire Bibliographique USMBA
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {filteredBooks.length} ouvrage{filteredBooks.length > 1 ? 's' : ''} répertorié{filteredBooks.length > 1 ? 's' : ''} • Contrôle direct des prêts en 1 clic
            </p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
            Gestion du fonds
          </span>
        </div>

        {/* 1. VUE MOBILE EN CARTES STRUCTURÉES (Affichée sur écrans < 640px) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredBooks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun ouvrage ne correspond à votre recherche.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {book.titre}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {book.auteur}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        <Layers className="w-3 h-3" />
                        {book.categorie}
                      </span>
                      {book.cote && (
                        <span className="font-mono text-[10px] text-indigo-700 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          {book.cote}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                        <Barcode className="w-3 h-3" />
                        {book.isbn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contrôle de disponibilité & Actions mobiles tactiles */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleDisponible(book.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden touch-manipulation ${
                        book.disponible ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={book.disponible}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          book.disponible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-semibold ${book.disponible ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {book.disponible ? 'En rayon' : 'Emprunté'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(book)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition touch-manipulation cursor-pointer"
                      title="Modifier la notice"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id, book.titre)}
                      className="p-2 text-rose-500 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition touch-manipulation cursor-pointer"
                      title="Retirer de l'inventaire"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. VUE DESKTOP EN TABLEAU STRUCTURÉ (sans image) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ouvrage & Référence</th>
                <th className="py-3 px-4">Auteur(s)</th>
                <th className="py-3 px-4">Discipline & Éditeur</th>
                <th className="py-3 px-4 text-center">Statut Rayon (1-Clic)</th>
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
                    <td className="py-3.5 px-4">
                      <div className="min-w-0 max-w-sm">
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {book.titre}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {book.isbn}
                          </span>
                          {book.cote && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                              <Bookmark className="w-2.5 h-2.5" />
                              {book.cote}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs">
                      {book.auteur}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Layers className="w-3 h-3 text-indigo-600" />
                          {book.categorie}
                        </span>
                        {(book.editeur || book.annee) && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            {book.editeur && <span>{book.editeur}</span>}
                            {book.annee && <span>• {book.annee}</span>}
                          </div>
                        )}
                      </div>
                    </td>

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
                          title="Changer la disponibilité"
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

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Modifier la notice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.titre)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Supprimer l'ouvrage"
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

      {/* Modal "Ajouter un livre" */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Header modal */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">Nouvel ouvrage dans le fonds</h3>
                  <p className="text-xs text-slate-500">Scan code-barres ISBN ou saisie de la fiche bibliographique</p>
                </div>
              </div>
              <button
                onClick={handleCloseAddModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:bg-slate-100 transition touch-manipulation cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddTab('scan')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition touch-manipulation cursor-pointer ${
                  addTab === 'scan'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
                }`}
              >
                <ScanBarcode className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>1. Scan ISBN</span>
              </button>

              <button
                type="button"
                onClick={() => setAddTab('manual')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition touch-manipulation cursor-pointer ${
                  addTab === 'manual'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
                }`}
              >
                <PenTool className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>2. Fiche manuelle</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Onglet 1: Scan ISBN via html5-qrcode */}
              {addTab === 'scan' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 leading-relaxed bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      Pointez la caméra vers le code-barres ISBN au dos du manuel universitaire.
                    </div>
                  </div>

                  {/* Zone de scan caméra avec viseur animé */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200 bg-slate-900 w-full max-w-full min-h-[220px] sm:min-h-[250px] flex items-center justify-center shadow-inner">
                    <div id="reader" className="w-full max-w-full overflow-hidden" />

                    {cameraStatus === 'active' && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
                        <div className="relative w-56 sm:w-64 h-32 sm:h-36 border-2 border-indigo-400/80 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-400" />
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-400" />
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-400" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-400" />
                          <div className="scan-laser-line absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                        </div>
                      </div>
                    )}

                    {cameraStatus === 'starting' && (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                        <span className="text-xs font-medium">Activation du capteur optique...</span>
                      </div>
                    )}

                    {cameraStatus === 'error' && (
                      <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white p-4 text-center space-y-3">
                        <AlertCircle className="w-7 h-7 text-amber-400 shrink-0" />
                        <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                          {cameraErrorMessage || "Accès caméra impossible."}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center pt-1">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition touch-manipulation cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Réessayer
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition touch-manipulation cursor-pointer"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                            Photo code-barres
                          </button>
                        </div>
                      </div>
                    )}

                    {cameraStatus === 'success' && (
                      <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                        <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-bounce" />
                        <span className="text-sm font-bold text-emerald-200">ISBN détecté !</span>
                        <span className="font-mono text-xs text-white bg-emerald-800/80 px-3 py-1 rounded-full">
                          {formIsbn}
                        </span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Actions de secours et exemples réels */}
                  <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs font-semibold text-slate-700">Scan alternatif :</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1 transition touch-manipulation cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        Importer une photo
                      </button>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 mb-1.5">
                        Ou tester avec un exemple d'ISBN réel :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSimulateScan('978-0262046305')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-slate-700 text-[11px] font-mono transition touch-manipulation cursor-pointer"
                        >
                          978-0262046305 (CLRS Algorithmes)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateScan('978-0387310732')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-slate-700 text-[11px] font-mono transition touch-manipulation cursor-pointer"
                        >
                          978-0387310732 (Bishop ML)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setAddTab('manual')}
                      className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl transition touch-manipulation cursor-pointer"
                    >
                      Compléter la fiche &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet 2: Saisie manuelle structurée */}
              {addTab === 'manual' && (
                <form onSubmit={handleSaveNewBook} className="space-y-3">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  {formIsbn && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Code ISBN identifié : <strong>{formIsbn}</strong></span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Numéro ISBN *
                      </label>
                      <div className="relative">
                        <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formIsbn}
                          onChange={(e) => setFormIsbn(e.target.value)}
                          placeholder="Ex: 978-0262046305"
                          className="w-full text-sm sm:text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Titre de l'ouvrage *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitre}
                        onChange={(e) => setFormTitre(e.target.value)}
                        placeholder="Ex: Introduction to Algorithms"
                        className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Auteur(s) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formAuteur}
                        onChange={(e) => setFormAuteur(e.target.value)}
                        placeholder="Ex: T. Cormen, C. Leiserson..."
                        className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Discipline / Catégorie
                      </label>
                      <input
                        type="text"
                        value={formCategorie}
                        onChange={(e) => setFormCategorie(e.target.value)}
                        placeholder="Ex: Informatique & Algorithmique"
                        className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cote de rangement en rayon
                      </label>
                      <div className="relative">
                        <Bookmark className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={formCote}
                          onChange={(e) => setFormCote(e.target.value)}
                          placeholder="Ex: INFO-COR-01"
                          className="w-full text-sm sm:text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maison d'édition
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={formEditeur}
                          onChange={(e) => setFormEditeur(e.target.value)}
                          placeholder="Ex: MIT Press / Dunod"
                          className="w-full text-sm sm:text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Année d'édition
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          value={formAnnee}
                          onChange={(e) => setFormAnnee(e.target.value)}
                          placeholder="2022"
                          className="w-full text-sm sm:text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-semibold text-slate-700">Disponible immédiatement</span>
                      <button
                        type="button"
                        onClick={() => setFormDisponible(!formDisponible)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 touch-manipulation ${
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Résumé / Description pédagogique
                      </label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Présentation des thématiques et notions abordées dans cet ouvrage..."
                        className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setAddTab('scan')}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition touch-manipulation cursor-pointer"
                    >
                      &larr; Retour Scan
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-3 sm:py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-xs transition touch-manipulation cursor-pointer"
                    >
                      Enregistrer l'ouvrage
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Modifier la fiche bibliographique</h3>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:bg-slate-100 transition touch-manipulation cursor-pointer"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l'ouvrage *</label>
                <input
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Auteur(s) *</label>
                  <input
                    type="text"
                    required
                    value={formAuteur}
                    onChange={(e) => setFormAuteur(e.target.value)}
                    className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discipline</label>
                  <input
                    type="text"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value)}
                    className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formIsbn}
                    onChange={(e) => setFormIsbn(e.target.value)}
                    className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cote de rangement</label>
                  <input
                    type="text"
                    value={formCote}
                    onChange={(e) => setFormCote(e.target.value)}
                    placeholder="Ex: INFO-COR-01"
                    className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maison d'édition</label>
                  <input
                    type="text"
                    value={formEditeur}
                    onChange={(e) => setFormEditeur(e.target.value)}
                    placeholder="Ex: Dunod"
                    className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Année</label>
                  <input
                    type="number"
                    value={formAnnee}
                    onChange={(e) => setFormAnnee(e.target.value)}
                    placeholder="2022"
                    className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Résumé & Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-sm sm:text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Disponibilité immédiate en rayon</span>
                <button
                  type="button"
                  onClick={() => setFormDisponible(!formDisponible)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 touch-manipulation ${
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

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="w-full sm:flex-1 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition touch-manipulation cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-xs transition touch-manipulation cursor-pointer"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
