import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, motDePasse?: string) => Promise<boolean> | boolean;
  register: (nom: string, email: string, motDePasse?: string) => Promise<boolean> | boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'bibliotech_user_session';

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
   * Si l'email est 'admin@biblio.com' ou contient 'admin' -> rôle GESTIONNAIRE
   * Sinon -> rôle ETUDIANT
   */
  const login = (email: string, _motDePasse?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'admin@biblio.com' || cleanEmail.includes('admin');
    const role: Role = isAdmin ? 'GESTIONNAIRE' : 'ETUDIANT';

    // Extraction d'un nom par défaut à partir de l'email si non spécifié
    const inferredName = isAdmin
      ? 'Gestionnaire Bibliothèque'
      : cleanEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

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
   * Inscription d'un nouvel utilisateur (crée un rôle ETUDIANT et connecte)
   */
  const register = (nom: string, email: string, _motDePasse?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      role: 'ETUDIANT',
      nom: nom.trim() || 'Étudiant',
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
