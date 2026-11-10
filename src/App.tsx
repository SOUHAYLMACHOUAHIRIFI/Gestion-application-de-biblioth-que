import { useState, useEffect } from 'react';
import {
  BookOpen,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import StudentCatalog from './components/StudentCatalog';
import ManagerDashboard from './components/ManagerDashboard';
import { Book, mockBooks as initialMockBooks } from './types';

const BOOKS_STORAGE_KEY = 'bibliotech_catalog_books';

function MainLayout() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as Book[];
      }
    } catch (e) {
      console.error('Erreur chargement inventaire :', e);
    }
    return initialMockBooks;
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Erreur sauvegarde inventaire :', e);
    }
  }, [books]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo et Nom */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Biblio<span className="text-indigo-600">Tech</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Gestion de Bibliothèque
              </span>
            </div>
          </div>

          {/* Rôle connecté et bouton Déconnexion */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-100/90 pl-3 pr-2 py-1.5 rounded-full border border-slate-200">
                <div className="flex items-center gap-1.5">
                  {user.role === 'GESTIONNAIRE' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      GESTIONNAIRE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 tracking-wide uppercase">
                      <GraduationCap className="w-3.5 h-3.5" />
                      ETUDIANT
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[130px] truncate sm:max-w-none">
                    {user.nom}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-600 hover:text-white bg-white hover:bg-rose-600 border border-rose-200 rounded-full transition duration-150 shadow-2xs"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Non connecté</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal avec décalage pour le header fixe (pt-20) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full flex flex-col">
        {/* Condition 1 : Si user est null -> Affiche <AuthForm /> */}
        {!user && (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="text-center mb-6 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Portail d'authentification
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Bienvenue sur BiblioTech
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Veuillez vous connecter pour accéder à votre espace personnalisé selon votre profil.
              </p>
            </div>
            <AuthForm showAdminHelper={true} />
          </div>
        )}

        {/* Condition 2 : Si user.role === 'ETUDIANT' -> Affiche <StudentCatalog /> */}
        {user?.role === 'ETUDIANT' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-200 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-300" />
                Espace Étudiant
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Catalogue de Consultation
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Bonjour {user.nom}. Consultez librement la collection d'ouvrages et vérifiez la disponibilité en rayon en temps réel.
              </p>
            </div>

            <StudentCatalog books={books} />
          </div>
        )}

        {/* Condition 3 : Si user.role === 'GESTIONNAIRE' -> Affiche <ManagerDashboard /> */}
        {user?.role === 'GESTIONNAIRE' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Espace Gestionnaire
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Panneau d'Administration de la Bibliothèque
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Gestion des prêts, contrôle des stocks, modification des fiches et enregistrement par scan code-barres ISBN.
              </p>
            </div>

            <ManagerDashboard books={books} onBooksChange={setBooks} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>BiblioTech • Système de gestion de bibliothèque avec React & TypeScript</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Connecté : <strong className="text-slate-600">{user ? user.email : 'Aucun'}</strong>
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
