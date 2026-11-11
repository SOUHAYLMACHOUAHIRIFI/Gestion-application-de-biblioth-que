import { useState, useEffect } from 'react';
import {
  BookOpen,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Clock,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import StudentCatalog from './components/StudentCatalog';
import ManagerDashboard from './components/ManagerDashboard';
import {
  Book,
  mockBooks as initialMockBooks,
  EmpruntLivre,
  NotificationRappel,
  initialMockLoans
} from './types';

const BOOKS_STORAGE_KEY = 'bibliotech_usmba_catalog_v4';
const LOANS_STORAGE_KEY = 'bibliotech_usmba_loans_v4';

function MainLayout() {
  const { user, logout } = useAuth();

  // 1. Inventaire des livres
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Book[];
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].isbn.startsWith('978-0262')) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erreur chargement inventaire :', e);
    }
    return initialMockBooks;
  });

  // 2. Registre des emprunts & retards
  const [loans, setLoans] = useState<EmpruntLivre[]>(() => {
    try {
      const saved = localStorage.getItem(LOANS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as EmpruntLivre[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erreur chargement emprunts :', e);
    }
    return initialMockLoans;
  });

  // Sauvegardes localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Erreur sauvegarde inventaire :', e);
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
    } catch (e) {
      console.error('Erreur sauvegarde emprunts :', e);
    }
  }, [loans]);

  // Forcer le défilement au début de la page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [user]);

  // Action : Enregistrer un nouvel emprunt avec date et heure exacte
  const handleCreateLoan = (
    bookId: string,
    studentEmail: string,
    studentNom: string,
    dureeJours: number = 14
  ) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const now = new Date();
    const dateEmpruntAffichee =
      now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' +
      now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const echeance = new Date(now.getTime() + dureeJours * 24 * 60 * 60 * 1000);
    const dateRetourPrevueAffichee = echeance.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const newLoan: EmpruntLivre = {
      id: `emp_${Date.now()}`,
      bookId: targetBook.id,
      titreLivre: targetBook.titre,
      isbnLivre: targetBook.isbn,
      coteLivre: targetBook.cote,
      studentId: `usr_${Date.now()}`,
      studentNom: studentNom || 'Étudiant USMBA',
      studentEmail: studentEmail || 'etudiant@usmba.ac.ma',
      dateEmprunt: now.toISOString(),
      dateEmpruntAffichee,
      dateRetourPrevue: echeance.toISOString(),
      dateRetourPrevueAffichee,
      statut: 'EN_COURS',
      notifications: [],
    };

    setLoans((prev) => [newLoan, ...prev]);

    // Marquer l'ouvrage comme non disponible dans le catalogue
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, disponible: false } : b))
    );
  };

  // Action : Enregistrer la restitution d'un livre (retour en rayon)
  const handleReturnBook = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const now = new Date();
    const dateRetourEffectiveAffichee =
      now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' +
      now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              statut: 'RETOURNE',
              dateRetourEffective: now.toISOString(),
              dateRetourEffectiveAffichee,
            }
          : l
      )
    );

    // Remettre le livre en disponibilité
    setBooks((prev) =>
      prev.map((b) => (b.id === targetLoan.bookId ? { ...b, disponible: true } : b))
    );
  };

  // Action : Envoyer une notification de rappel à l'étudiant
  const handleSendNotification = (
    loanId: string,
    message: string,
    type: 'RAPPEL_RETARD' | 'AVERTISSEMENT' | 'URGENT'
  ) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const now = new Date();
    const dateEnvoi =
      now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' +
      now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newNotif: NotificationRappel = {
      id: `notif_${Date.now()}`,
      empruntId: loanId,
      studentEmail: targetLoan.studentEmail,
      studentNom: targetLoan.studentNom,
      titreLivre: targetLoan.titreLivre,
      dateEnvoi,
      type,
      message,
      lu: false,
    };

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              notifications: [newNotif, ...l.notifications],
            }
          : l
      )
    );
  };

  // Action : Marquer une notification comme lue par l'étudiant
  const handleMarkNotificationRead = (notificationId: string) => {
    setLoans((prev) =>
      prev.map((loan) => ({
        ...loan,
        notifications: loan.notifications.map((n) =>
          n.id === notificationId ? { ...n, lu: true } : n
        ),
      }))
    );
  };

  // Compteurs d'alerte pour le header
  const countRetardsGlobal = loans.filter((l) => l.statut === 'EN_RETARD').length;
  const studentUnreadNotifs = loans
    .filter((l) => user && l.studentEmail.toLowerCase().includes(user.email.split('@')[0]))
    .flatMap((l) => l.notifications)
    .filter((n) => !n.lu).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header fixe responsive */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Logo et Nom de l'application */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex items-center">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Biblio<span className="text-indigo-600">Tech</span>
                </span>
                <span className="ml-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  USMBA
                </span>
              </div>
            </div>

            {/* Rôle compact affiché sur mobile à côté du logo si connecté */}
            {user && (
              <div className="sm:hidden flex items-center gap-1.5">
                {user.role === 'GESTIONNAIRE' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                    <GraduationCap className="w-3 h-3" />
                    Étudiant
                  </span>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition touch-manipulation cursor-pointer"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Rôle connecté et bouton Déconnexion complet (affiché sur sm+) */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-slate-100/90 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-200">
                <div className="flex items-center gap-1.5">
                  {user.role === 'GESTIONNAIRE' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      GESTIONNAIRE
                      {countRetardsGlobal > 0 && (
                        <span className="ml-1 bg-rose-500 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                          {countRetardsGlobal}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 tracking-wide uppercase">
                      <GraduationCap className="w-3.5 h-3.5" />
                      ÉTUDIANT
                      {studentUnreadNotifs > 0 && (
                        <span className="ml-1 bg-rose-500 text-white rounded-full px-1.5 py-0.2 text-[10px] animate-pulse">
                          {studentUnreadNotifs} rappel
                        </span>
                      )}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[160px] truncate md:max-w-none">
                    {user.nom}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-white hover:bg-rose-600 active:bg-rose-700 border border-rose-200 rounded-full transition duration-150 shadow-2xs touch-manipulation cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Portail Universitaire USMBA</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 w-full flex flex-col">
        {/* 1. Point d'entrée unique si non connecté */}
        {!user && (
          <div className="w-full flex-1 flex flex-col items-center pt-2 sm:pt-6 pb-12">
            <div className="text-center mb-6 space-y-2 px-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Bibliothèque Universitaire • USMBA
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Portail Bibliothèque BiblioTech
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Connectez-vous avec vos identifiants institutionnels pour accéder au catalogue universitaire ou à l'espace gestionnaire.
              </p>
            </div>
            <AuthForm />
          </div>
        )}

        {/* 2. Interface Étudiant */}
        {user?.role === 'ETUDIANT' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-200 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-300" />
                Espace Étudiant • USMBA
              </div>
              <h1 className="text-lg sm:text-2xl font-bold">
                Fonds Documentaire Universitaire
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Bienvenue {user.nom}. Consultez librement la collection d'ouvrages réels, vérifiez vos emprunts en cours et leurs dates limites de retour.
              </p>
            </div>

            <StudentCatalog
              books={books}
              loans={loans}
              currentStudentEmail={user.email}
              currentStudentNom={user.nom}
              onMarkNotificationRead={handleMarkNotificationRead}
            />
          </div>
        )}

        {/* 3. Interface Gestionnaire */}
        {user?.role === 'GESTIONNAIRE' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Espace Gestionnaire • USMBA
              </div>
              <h1 className="text-lg sm:text-2xl font-bold">
                Gestion & Inventaire de la Bibliothèque
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Suivi des emprunts avec date et heure exacte de prise, alertes de retard, envoi de notifications officielles et inventaire du fonds.
              </p>
            </div>

            <ManagerDashboard
              books={books}
              onBooksChange={setBooks}
              loans={loans}
              onCreateLoan={handleCreateLoan}
              onReturnBook={handleReturnBook}
              onSendNotification={handleSendNotification}
            />
          </div>
        )}
      </main>

      {/* Footer responsive */}
      <footer className="bg-white border-t border-slate-200 py-4 sm:py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p>BiblioTech • Bibliothèque Universitaire Sidi Mohamed Ben Abdellah (USMBA)</p>
          <div className="flex items-center gap-2 sm:gap-4 text-slate-400 text-[11px] sm:text-xs">
            <span>
              Session : <strong className="text-slate-600">{user ? user.email : 'Aucun'}</strong>
            </span>
            <span>•</span>
            <span>
              Rôle : <strong className="text-slate-600">{user ? user.role : 'AUCUN'}</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
