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
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  Bell,
  CheckCircle,
  UserCheck,
  RotateCcw,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Book, EmpruntLivre, NotificationRappel, mockBooks as defaultMockBooks } from '../types';

interface ManagerDashboardProps {
  books?: Book[];
  onBooksChange?: (books: Book[]) => void;
  loans: EmpruntLivre[];
  onCreateLoan: (bookId: string, studentEmail: string, studentNom: string, dureeJours?: number) => void;
  onReturnBook: (loanId: string) => void;
  onSendNotification: (loanId: string, message: string, type: 'RAPPEL_RETARD' | 'AVERTISSEMENT' | 'URGENT') => void;
}

export default function ManagerDashboard({
  books: initialBooks = defaultMockBooks,
  onBooksChange,
  loans,
  onCreateLoan,
  onReturnBook,
  onSendNotification,
}: ManagerDashboardProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [mainTab, setMainTab] = useState<'inventory' | 'loans'>('inventory');

  // État filtres emprunts
  const [loanSearchTerm, setLoanSearchTerm] = useState('');
  const [loanFilterStatus, setLoanFilterStatus] = useState<'TOUS' | 'EN_RETARD' | 'EN_COURS' | 'RETOURNE'>('TOUS');

  // Modal d'envoi de notification de retard
  const [selectedLoanForNotif, setSelectedLoanForNotif] = useState<EmpruntLivre | null>(null);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'RAPPEL_RETARD' | 'AVERTISSEMENT' | 'URGENT'>('RAPPEL_RETARD');
  const [notifSentSuccess, setNotifSentSuccess] = useState<string | null>(null);

  // Modal d'enregistrement d'emprunt
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [newLoanBookId, setNewLoanBookId] = useState('');
  const [newLoanStudentEmail, setNewLoanStudentEmail] = useState('');
  const [newLoanStudentNom, setNewLoanStudentNom] = useState('');
  const [newLoanDuree, setNewLoanDuree] = useState('14');
  const [newLoanError, setNewLoanError] = useState<string | null>(null);

  // État de la modal d'ajout livre
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

  // Référence scanner
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

  // Bascule rapide statut disponible
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

  // Gestion succès scan
  const handleScanSuccess = (decodedText: string) => {
    const cleanedText = decodedText.trim();
    setFormIsbn(cleanedText);
    setCameraStatus('success');

    stopCamera();

    setTimeout(() => {
      setAddTab('manual');
    }, 1000);
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Erreur arrêt scanner :", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

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
        setCameraErrorMessage('Accès caméra refusé. Saisissez le code ISBN manuellement.');
      } else {
        setCameraErrorMessage("Webcam indisponible. Utilisez la saisie manuelle.");
      }
    }
  };

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
      console.warn('Erreur lecture image :', err);
      setCameraErrorMessage('Aucun code-barres net détecté. Réessayez ou saisissez manuellement.');
    }
  };

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

  const handleCloseAddModal = () => {
    stopCamera();
    setIsAddModalOpen(false);
  };

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
      description: formDescription.trim() || 'Notice bibliographique enregistrée.',
    };

    updateBooks([newBook, ...books]);
    handleCloseAddModal();
  };

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

  // Préparation de l'envoi de notification
  const handleOpenNotifModal = (loan: EmpruntLivre) => {
    setSelectedLoanForNotif(loan);
    setNotifType(loan.statut === 'EN_RETARD' ? 'RAPPEL_RETARD' : 'AVERTISSEMENT');
    setNotifMessage(
      `Bonjour ${loan.studentNom},\n\nLa Bibliothèque Universitaire USMBA vous informe que l'ouvrage "${loan.titreLivre}" emprunté le ${loan.dateEmpruntAffichee} devait être restitué au plus tard le ${loan.dateRetourPrevueAffichee}.\n\nVous êtes actuellement en retard de restitution. Merci de déposer l'ouvrage au guichet de prêt de la BU dans les 24 heures afin d'éviter toute suspension de prêt.\n\nService du Prêt - Bibliothèque Universitaire USMBA`
    );
  };

  const handleSendNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForNotif || !notifMessage.trim()) return;

    onSendNotification(selectedLoanForNotif.id, notifMessage.trim(), notifType);
    setNotifSentSuccess(`Rappel envoyé avec succès à ${selectedLoanForNotif.studentEmail} !`);
    setTimeout(() => {
      setNotifSentSuccess(null);
      setSelectedLoanForNotif(null);
    }, 1800);
  };

  // Enregistrement d'un nouvel emprunt
  const handleOpenNewLoanModal = () => {
    const firstAvailable = books.find((b) => b.disponible);
    setNewLoanBookId(firstAvailable ? firstAvailable.id : '');
    setNewLoanStudentEmail('etudiant@usmba.ac.ma');
    setNewLoanStudentNom('Étudiant USMBA');
    setNewLoanDuree('14');
    setNewLoanError(null);
    setIsNewLoanModalOpen(true);
  };

  const handleSaveNewLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setNewLoanError(null);

    if (!newLoanBookId) {
      setNewLoanError('Veuillez sélectionner un ouvrage disponible.');
      return;
    }
    if (!newLoanStudentEmail.trim()) {
      setNewLoanError("L'adresse email de l'étudiant est requise.");
      return;
    }

    const duree = parseInt(newLoanDuree, 10) || 14;
    onCreateLoan(newLoanBookId, newLoanStudentEmail.trim(), newLoanStudentNom.trim() || 'Étudiant USMBA', duree);
    setIsNewLoanModalOpen(false);
  };

  // Statistiques emprunts
  const countRetards = loans.filter((l) => l.statut === 'EN_RETARD').length;
  const countEnCours = loans.filter((l) => l.statut === 'EN_COURS').length;
  const countTotalNotifs = loans.reduce((acc, l) => acc + l.notifications.length, 0);

  // Filtrage des livres
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

  // Filtrage des emprunts
  const filteredLoans = loans.filter((loan) => {
    const q = loanSearchTerm.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      loan.titreLivre.toLowerCase().includes(q) ||
      loan.studentNom.toLowerCase().includes(q) ||
      loan.studentEmail.toLowerCase().includes(q) ||
      loan.isbnLivre.includes(q) ||
      (loan.coteLivre && loan.coteLivre.toLowerCase().includes(q));

    const matchesStatus =
      loanFilterStatus === 'TOUS' || loan.statut === loanFilterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Sélecteur d'onglets principal : Inventaire vs Emprunts & Retards */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          type="button"
          onClick={() => setMainTab('inventory')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition touch-manipulation cursor-pointer ${
            mainTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Fonds & Inventaire ({books.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('loans')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition touch-manipulation cursor-pointer relative ${
            mainTab === 'loans'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Gestion des Emprunts & Retards</span>
          {countRetards > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                mainTab === 'loans'
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-100 text-rose-700 animate-pulse'
              }`}
            >
              {countRetards} en retard
            </span>
          )}
        </button>
      </div>

      {/* ======================= ONGLET 2: GESTION DES EMPRUNTS & RETARDS ======================= */}
      {mainTab === 'loans' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Emprunts en cours
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {countEnCours}
              </div>
              <p className="text-[11px] text-slate-400">Ouvrages prêtés aux étudiants</p>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Ouvrages en retard
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-700">
                {countRetards}
              </div>
              <p className="text-[11px] text-rose-600 font-medium">Nécessitent un rappel</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Rappels envoyés
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {countTotalNotifs}
              </div>
              <p className="text-[11px] text-slate-400">Notifications délivrées</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Total des dossiers
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {loans.length}
              </div>
              <p className="text-[11px] text-slate-400">Historique complet</p>
            </div>
          </div>

          {/* Barre de filtres et d'action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={loanSearchTerm}
                onChange={(e) => setLoanSearchTerm(e.target.value)}
                placeholder="Rechercher par étudiant, email, titre de livre ou ISBN..."
                className="w-full text-sm sm:text-xs pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={loanFilterStatus}
                onChange={(e) => setLoanFilterStatus(e.target.value as any)}
                className="text-xs py-3 sm:py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="EN_RETARD">⚠️ En retard uniquement</option>
                <option value="EN_COURS">🟢 En cours</option>
                <option value="RETOURNE">✔️ Restitués</option>
              </select>

              <button
                type="button"
                onClick={handleOpenNewLoanModal}
                className="flex items-center gap-1.5 px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel emprunt</span>
              </button>
            </div>
          </div>

          {/* Tableau / Cartes des emprunts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Suivi des Prêts Universitaires en Temps Réel
                </h3>
                <p className="text-xs text-slate-500">
                  Visualisez l'horodatage précis à la seconde près et envoyez un rappel de retard aux étudiants.
                </p>
              </div>
            </div>

            {filteredLoans.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucun emprunt ne correspond aux critères de recherche.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition ${
                      loan.statut === 'EN_RETARD'
                        ? 'bg-rose-50/30 hover:bg-rose-50/50'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Colonne 1 : Détails Livre & Étudiant */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {loan.statut === 'EN_RETARD' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            RETARD DE RESTITUTION
                          </span>
                        )}
                        {loan.statut === 'EN_COURS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Prêt en cours
                          </span>
                        )}
                        {loan.statut === 'RETOURNE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Check className="w-3 h-3 text-slate-600" />
                            Restitué
                          </span>
                        )}

                        {loan.coteLivre && (
                          <span className="font-mono text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            Cote: {loan.coteLivre}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-base text-slate-900 leading-snug">
                        {loan.titreLivre}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          {loan.studentNom}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({loan.studentEmail})
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          ISBN: {loan.isbnLivre}
                        </span>
                      </div>
                    </div>

                    {/* Colonne 2 : Horodatage exact (Date et Heure de prêt) & Échéance */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-xs shrink-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Date et heure exacte de prêt :
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {loan.dateEmpruntAffichee}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Date limite de retour :
                          </span>
                          <span
                            className={`font-semibold text-xs ${
                              loan.statut === 'EN_RETARD' ? 'text-rose-600 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {loan.dateRetourPrevueAffichee}
                          </span>
                        </div>
                      </div>

                      {loan.dateRetourEffectiveAffichee && (
                        <div className="text-[10px] text-emerald-700 font-medium pt-0.5">
                          Restitué le : {loan.dateRetourEffectiveAffichee}
                        </div>
                      )}
                    </div>

                    {/* Colonne 3 : Actions Gestionnaire (Notification retard / Retour livre) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
                      {loan.statut !== 'RETOURNE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenNotifModal(loan)}
                            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer touch-manipulation ${
                              loan.statut === 'EN_RETARD'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                            title="Envoyer un rappel officiel par notification"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {loan.statut === 'EN_RETARD' ? 'Envoyer rappel de retard' : 'Rappel anticipé'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onReturnBook(loan.id)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer touch-manipulation"
                            title="Enregistrer la restitution du livre"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retour du livre</span>
                          </button>
                        </>
                      )}

                      {/* Historique notifications déjà envoyées */}
                      {loan.notifications.length > 0 && (
                        <div className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg text-center">
                          {loan.notifications.length} rappel{loan.notifications.length > 1 ? 's' : ''} envoyé{loan.notifications.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= ONGLET 1: FONDS & INVENTAIRE ======================= */}
      {mainTab === 'inventory' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
          {/* Barre d'action supérieure */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par titre, auteur, ISBN ou cote de rangement..."
                className="w-full text-sm sm:text-xs pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 sm:flex-none text-xs py-3 sm:py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un ouvrage</span>
              </button>
            </div>
          </div>

          {/* Inventaire Bibliographique */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
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

            {/* VUE MOBILE */}
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

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleDisponible(book.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 touch-manipulation ${
                            book.disponible ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          role="switch"
                          aria-checked={book.disponible}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
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
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Modifier la notice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.titre)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Supprimer l'ouvrage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* VUE TABLEAU DESKTOP */}
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
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
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
        </div>
      )}

      {/* ======================= MODAL ENVOI NOTIFICATION DE RETARD ======================= */}
      {selectedLoanForNotif && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-rose-950">
                    Notifier l'étudiant en retard
                  </h3>
                  <p className="text-xs text-rose-700">Rappel officiel pour restitution d'ouvrage</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoanForNotif(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotifSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {notifSentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{notifSentSuccess}</span>
                </div>
              )}

              {/* Récapitulatif du prêt */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Étudiant destinataire :</span>
                  <span className="font-bold text-slate-800">{selectedLoanForNotif.studentNom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email institutionnel :</span>
                  <span className="font-mono text-indigo-600 font-semibold">{selectedLoanForNotif.studentEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ouvrage :</span>
                  <span className="font-medium text-slate-800 truncate max-w-[240px]">{selectedLoanForNotif.titreLivre}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400">Prêté le :</span>
                  <span className="font-mono font-medium text-slate-700">{selectedLoanForNotif.dateEmpruntAffichee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date limite dépassée :</span>
                  <span className="font-mono font-bold text-rose-600">{selectedLoanForNotif.dateRetourPrevueAffichee}</span>
                </div>
              </div>

              {/* Degré d'urgence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Degré de gravité du rappel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotifType('RAPPEL_RETARD')}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                      notifType === 'RAPPEL_RETARD'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Rappel standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifType('AVERTISSEMENT')}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                      notifType === 'AVERTISSEMENT'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Avertissement
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifType('URGENT')}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                      notifType === 'URGENT'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Mise en demeure
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message envoyé à l'étudiant
                </label>
                <textarea
                  rows={5}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForNotif(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer la notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL NOUVEL EMPRUNT ======================= */}
      {isNewLoanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Enregistrer un nouvel emprunt
                  </h3>
                  <p className="text-xs text-slate-500">Horodatage précis à la seconde</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewLoanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewLoan} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
              {newLoanError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{newLoanError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sélectionner l'ouvrage disponible *
                </label>
                <select
                  required
                  value={newLoanBookId}
                  onChange={(e) => setNewLoanBookId(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Choisir un livre disponible --</option>
                  {books
                    .filter((b) => b.disponible)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.titre} ({b.cote || b.isbn})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email institutionnel de l'étudiant *
                </label>
                <input
                  type="email"
                  required
                  value={newLoanStudentEmail}
                  onChange={(e) => setNewLoanStudentEmail(e.target.value)}
                  placeholder="etudiant@usmba.ac.ma"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet de l'étudiant
                </label>
                <input
                  type="text"
                  value={newLoanStudentNom}
                  onChange={(e) => setNewLoanStudentNom(e.target.value)}
                  placeholder="Ex: Youssef El Amrani"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Durée de l'emprunt
                </label>
                <select
                  value={newLoanDuree}
                  onChange={(e) => setNewLoanDuree(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="7">7 jours (1 semaine)</option>
                  <option value="14">14 jours (2 semaines - standard)</option>
                  <option value="21">21 jours (3 semaines)</option>
                  <option value="30">30 jours (1 mois)</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Horodatage automatique
                </span>
                <p className="text-[11px] text-indigo-800">
                  La date et l'heure exacte courante seront enregistrées dans la notice du prêt et synchronisées avec le compte de l'étudiant.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLoanModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirmer le prêt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL AJOUT LIVRE ======================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
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
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddTab('scan')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                  addTab === 'scan'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ScanBarcode className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>1. Scan ISBN</span>
              </button>

              <button
                type="button"
                onClick={() => setAddTab('manual')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
                  addTab === 'manual'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>2. Fiche manuelle</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {addTab === 'scan' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 leading-relaxed bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      Pointez la caméra vers le code-barres ISBN au dos du manuel universitaire.
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200 bg-slate-900 w-full min-h-[220px] sm:min-h-[250px] flex items-center justify-center shadow-inner">
                    <div id="reader" className="w-full max-w-full overflow-hidden" />
                    {cameraStatus === 'starting' && (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                        <span className="text-xs font-medium">Activation du capteur optique...</span>
                      </div>
                    )}
                    {cameraStatus === 'error' && (
                      <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white p-4 text-center space-y-3">
                        <AlertCircle className="w-7 h-7 text-amber-400 shrink-0" />
                        <p className="text-xs text-slate-300 max-w-xs">{cameraErrorMessage}</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Réessayer
                        </button>
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

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setAddTab('manual')}
                      className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Compléter la fiche manuelle &rarr;
                    </button>
                  </div>
                </div>
              )}

              {addTab === 'manual' && (
                <form onSubmit={handleSaveNewBook} className="space-y-3">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Numéro ISBN *
                      </label>
                      <input
                        type="text"
                        required
                        value={formIsbn}
                        onChange={(e) => setFormIsbn(e.target.value)}
                        placeholder="Ex: 978-0262046305"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
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
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                        placeholder="Ex: T. Cormen, C. Leiserson"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                        placeholder="Ex: Informatique"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cote de rangement en rayon
                      </label>
                      <input
                        type="text"
                        value={formCote}
                        onChange={(e) => setFormCote(e.target.value)}
                        placeholder="Ex: INFO-COR-01"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maison d'édition
                      </label>
                      <input
                        type="text"
                        value={formEditeur}
                        onChange={(e) => setFormEditeur(e.target.value)}
                        placeholder="Ex: MIT Press / Dunod"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Description pédagogique
                      </label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Présentation des thématiques..."
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setAddTab('scan')}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
                    >
                      &larr; Retour Scan
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
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

      {/* ======================= MODAL EDITION LIVRE ======================= */}
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
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg active:bg-slate-100 transition cursor-pointer"
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
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discipline</label>
                  <input
                    type="text"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cote de rangement</label>
                  <input
                    type="text"
                    value={formCote}
                    onChange={(e) => setFormCote(e.target.value)}
                    placeholder="Ex: INFO-COR-01"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Disponibilité en rayon</span>
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

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="w-full sm:flex-1 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
