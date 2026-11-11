import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, motDePasse?: string) => Promise<boolean> | boolean;
  register: (nom: string, email: string, motDePasse?: string) => Promise<boolean> | boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'bibliotech_usmba_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (e) {
      console.error('Erreur lors du chargement de la session utilisateur :', e);
    }
    return null;
  });

  // Synchronisation avec le localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Erreur lors de la sauvegarde dans le localStorage :', e);
    }
  }, [user]);

  /**
   * Connexion de l'utilisateur
   * - admin@usmba.ac.ma ou contenant 'admin' -> rôle GESTIONNAIRE
   * - etudiant@usmba.ac.ma ou tout autre compte -> rôle ETUDIANT
   */
  const login = (email: string, _motDePasse?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'admin@usmba.ac.ma' || cleanEmail.includes('admin');
    const role: Role = isAdmin ? 'GESTIONNAIRE' : 'ETUDIANT';

    // Nom par défaut selon l'adresse email
    let inferredName = '';
    if (cleanEmail === 'admin@usmba.ac.ma') {
      inferredName = 'Administrateur USMBA';
    } else if (cleanEmail === 'etudiant@usmba.ac.ma') {
      inferredName = 'Étudiant USMBA';
    } else if (isAdmin) {
      inferredName = 'Gestionnaire Bibliothèque';
    } else {
      inferredName = cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      role,
      nom: inferredName,
    };

    setUser(loggedUser);
    return true;
  };

  /**
   * Inscription d'un nouvel utilisateur (crée un compte ETUDIANT et connecte)
   */
  const register = (nom: string, email: string, _motDePasse?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      role: 'ETUDIANT',
      nom: nom.trim() || 'Étudiant USMBA',
    };

    setUser(newUser);
    return true;
  };

  /**
   * Déconnexion et nettoyage de session
   */
  const logout = (): void => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Erreur lors de la suppression de la session :', e);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personnalisé pour accéder à l'authentification
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
