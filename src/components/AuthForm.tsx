import { useState, FormEvent } from 'react';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthFormProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthForm({
  onSuccess,
  initialMode = 'login',
}: AuthFormProps) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          setError('Veuillez saisir votre adresse email USMBA.');
          setIsLoading(false);
          return;
        }
        await login(email, password);
      } else {
        if (!nom.trim()) {
          setError('Veuillez renseigner votre nom complet.');
          setIsLoading(false);
          return;
        }
        if (!email.trim()) {
          setError('Veuillez saisir votre adresse email universitaire USMBA.');
          setIsLoading(false);
          return;
        }
        await register(nom, email, password);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de l'authentification.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Sélecteur d'onglets tactile */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200/80 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition duration-150 touch-manipulation ${
            mode === 'login'
              ? 'bg-white text-indigo-700 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/60'
          }`}
        >
          <LogIn className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Connexion</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl transition duration-150 touch-manipulation ${
            mode === 'register'
              ? 'bg-white text-indigo-700 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/60'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate">Inscription (Étudiant)</span>
        </button>
      </div>

      {/* En-tête d'information */}
      <div className="p-4 sm:p-6 pb-2">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {mode === 'login' ? 'Portail Bibliothèque USMBA' : 'Créer un compte étudiant USMBA'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {mode === 'login'
            ? 'Connectez-vous avec votre adresse institutionnelle (ex: admin@usmba.ac.ma ou etudiant@usmba.ac.ma).'
            : 'Inscription réservée aux étudiants universitaires USMBA pour consulter le fonds documentaire.'}
        </p>
      </div>

      {/* Formulaire avec tailles adaptées au mobile */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-2 space-y-4">
        {/* Alerte erreur */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Champ Nom (Inscription) */}
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Youssef El Amrani"
                className="w-full text-sm sm:text-xs pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        )}

        {/* Champ Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Adresse email institutionnelle <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'admin@usmba.ac.ma ou etudiant@usmba.ac.ma' : 'etudiant@usmba.ac.ma'}
              className="w-full text-sm sm:text-xs pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
          {mode === 'login' && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>Gestionnaire : <code className="text-indigo-600 font-mono font-medium">admin@usmba.ac.ma</code></span>
              <span>Étudiant : <code className="text-indigo-600 font-mono font-medium">etudiant@usmba.ac.ma</code></span>
            </div>
          )}
        </div>

        {/* Champ Mot de passe */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm sm:text-xs pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Badge rôle pour inscription */}
        {mode === 'register' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Votre compte sera automatiquement configuré avec le rôle <strong>ÉTUDIANT USMBA</strong>.</span>
          </div>
        )}

        {/* Bouton de validation tactile */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 sm:py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm sm:text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition active:scale-[0.99] disabled:opacity-50 touch-manipulation cursor-pointer"
        >
          {isLoading ? (
            <span>Chargement...</span>
          ) : mode === 'login' ? (
            <>
              <span>Se connecter</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Finaliser l'inscription</span>
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
