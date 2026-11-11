export type Role = 'ETUDIANT' | 'GESTIONNAIRE';

export interface User {
  id: string;
  email: string;
  role: Role;
  nom: string;
}

export interface Book {
  id: string;
  isbn: string;
  titre: string;
  auteur: string;
  categorie: string;
  cote?: string;
  annee?: number;
  editeur?: string;
  disponible: boolean;
  description: string;
  couvertureUrl?: string;
}

export type StatutEmprunt = 'EN_COURS' | 'EN_RETARD' | 'RETOURNE';

export interface NotificationRappel {
  id: string;
  empruntId: string;
  studentEmail: string;
  studentNom: string;
  titreLivre: string;
  dateEnvoi: string; // Ex: "11/11/2026 à 09:30:15"
  type: 'RAPPEL_RETARD' | 'AVERTISSEMENT' | 'URGENT';
  message: string;
  lu: boolean;
}

export interface EmpruntLivre {
  id: string;
  bookId: string;
  titreLivre: string;
  isbnLivre: string;
  coteLivre?: string;
  studentId: string;
  studentNom: string;
  studentEmail: string;
  dateEmprunt: string; // Date et heure exacte ISO
  dateEmpruntAffichee: string; // Ex: "03/11/2026 à 10:14:22"
  dateRetourPrevue: string; // Date d'échéance ISO
  dateRetourPrevueAffichee: string; // Ex: "10/11/2026"
  dateRetourEffective?: string;
  dateRetourEffectiveAffichee?: string;
  statut: StatutEmprunt;
  notifications: NotificationRappel[];
}

export interface UserCredentials {
  email: string;
  motDePasse: string;
}

export const DEFAULT_ADMIN = {
  id: 'usr_admin_01',
  email: 'admin@usmba.ac.ma',
  motDePasse: 'admin123',
  nom: 'Responsable BU (USMBA)',
  role: 'GESTIONNAIRE' as Role,
};

export const DEFAULT_STUDENT: User = {
  id: 'usr_etudiant_01',
  email: 'etudiant@usmba.ac.ma',
  nom: 'Étudiant USMBA',
  role: 'ETUDIANT',
};

export const mockBooks: Book[] = [
  {
    id: 'b1',
    isbn: '978-0262046305',
    titre: 'Introduction to Algorithms (CLRS)',
    auteur: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    categorie: 'Informatique & Algorithmique',
    cote: 'INFO-COR-01',
    annee: 2022,
    editeur: 'MIT Press',
    disponible: true,
    description: "Référence mondiale indispensable pour l'étude des algorithmes et structures de données avancées : complexité asymptotique, arbres équilibrés, programmation dynamique, graphes et flots réseaux.",
  },
  {
    id: 'b2',
    isbn: '978-0387310732',
    titre: 'Pattern Recognition and Machine Learning',
    auteur: 'Christopher M. Bishop',
    categorie: 'Intelligence Artificielle',
    cote: 'IA-BIS-04',
    annee: 2006,
    editeur: 'Springer',
    disponible: true,
    description: "Ouvrage fondamental sur l'apprentissage automatique et la reconnaissance de formes avec une approche bayésienne rigoureuse : régressions, réseaux neuronaux, machines à vecteurs de support (SVM) et modèles graphiques.",
  },
  {
    id: 'b3',
    isbn: '978-0133591620',
    titre: 'Modern Operating Systems (Systèmes d’exploitation)',
    auteur: 'Andrew S. Tanenbaum, Herbert Bos',
    categorie: 'Systèmes & Réseaux',
    cote: 'SYS-TAN-02',
    annee: 2014,
    editeur: 'Pearson',
    disponible: false,
    description: "Manuel incontournable détaillant l'architecture interne des systèmes d'exploitation : ordonnancement de processus, synchronisation, gestion de la mémoire paginée, virtualisation et sécurité informatique.",
  },
  {
    id: 'b4',
    isbn: '978-0078022159',
    titre: 'Database System Concepts (Systèmes de gestion de bases de données)',
    auteur: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    categorie: 'Bases de Données',
    cote: 'BDD-SIL-01',
    annee: 2019,
    editeur: 'McGraw-Hill',
    disponible: true,
    description: "Traité exhaustif sur les bases de données relationnelles et distribuées : modélisation relationnelle, SQL standard, optimisation de requêtes, transactions ACID, contrôle de concurrence et architectures NoSQL/Big Data.",
  },
  {
    id: 'b5',
    isbn: '978-2744070907',
    titre: 'Design Patterns : Les 23 modèles de conception réutilisables',
    auteur: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    categorie: 'Génie Logiciel',
    cote: 'GL-GOF-03',
    annee: 2000,
    editeur: 'Vuibert / Addison-Wesley',
    disponible: false,
    description: "Le livre classique du 'Gang of Four' (GoF) exposant les patrons de conception orientés objet réutilisables dans les architectures logicielles : fabrique abstraite, observateur, adaptateur, singleton, commande et décorateur.",
  },
  {
    id: 'b6',
    isbn: '978-2100494491',
    titre: 'Algèbre linéaire et ses applications',
    auteur: 'Gilbert Strang',
    categorie: 'Mathématiques',
    cote: 'MATH-STR-05',
    annee: 2017,
    editeur: 'Dunod',
    disponible: true,
    description: "Une approche moderne et intuitive de l'algèbre linéaire : espaces vectoriels, diagonalisation, décomposition en valeurs singulières (SVD), méthode des moindres carrés et applications directes au calcul scientifique et à la data science.",
  },
  {
    id: 'b7',
    isbn: '978-2804155988',
    titre: 'Physique générale : Mécanique et thermodynamique',
    auteur: 'Douglas C. Giancoli',
    categorie: 'Physique & Sciences',
    cote: 'PHYS-GIA-01',
    annee: 2014,
    editeur: 'De Boeck Supérieur',
    disponible: true,
    description: "Manuel complet couvrant les concepts fondamentaux de la mécanique newtonienne, de la dynamique du point, de l'énergie, de la rotation des solides et des principes de la thermodynamique avec exercices d'application.",
  },
  {
    id: 'b8',
    isbn: '978-2807301641',
    titre: 'Principes d’économie moderne',
    auteur: 'Joseph E. Stiglitz, Carl E. Walsh',
    categorie: 'Économie & Gestion',
    cote: 'ECO-STI-02',
    annee: 2018,
    editeur: 'De Boeck Supérieur',
    disponible: true,
    description: "Manuel de référence du Prix Nobel Joseph Stiglitz analysant les mécanismes microéconomiques et macroéconomiques : fonctionnement des marchés, politique monétaire, croissance, régulation et mondialisation économique.",
  },
  {
    id: 'b9',
    isbn: '978-2247198757',
    titre: 'Introduction générale à l’étude du droit',
    auteur: 'François Terré, Nicolas Molfessis',
    categorie: 'Droit & Sciences Juridiques',
    cote: 'DROIT-TER-01',
    annee: 2021,
    editeur: 'Dalloz',
    disponible: true,
    description: "Ouvrage fondamental d'initiation juridique présentant la théorie de la règle de droit, la hiérarchie des normes, les sources jurisprudentielles, la séparation des pouvoirs et la méthodologie de l'analyse juridique.",
  },
  {
    id: 'b10',
    isbn: '978-2100725830',
    titre: 'Chimie organique : Cours et exercices corrigés',
    auteur: 'Paul Arnaud, Brigitte Jamart, Jacques Bodiguel, Nicolas Brosse',
    categorie: 'Chimie & Biologie',
    cote: 'CHIM-ARN-02',
    annee: 2015,
    editeur: 'Dunod',
    disponible: false,
    description: "Guide pédagogique de référence couvrant la stéréochimie, les mécanismes réactionnels fondamentaux (substitutions, éliminations, additions), les orbitales moléculaires et la réactivité des grandes familles fonctionnelles.",
  },
];

export const initialMockLoans: EmpruntLivre[] = [
  {
    id: 'emp_01',
    bookId: 'b3',
    titreLivre: 'Modern Operating Systems (Systèmes d’exploitation)',
    isbnLivre: '978-0133591620',
    coteLivre: 'SYS-TAN-02',
    studentId: 'usr_etudiant_01',
    studentNom: 'Étudiant USMBA (Youssef El Amrani)',
    studentEmail: 'etudiant@usmba.ac.ma',
    dateEmprunt: '2026-11-03T10:14:22.000Z',
    dateEmpruntAffichee: '03/11/2026 à 10:14:22',
    dateRetourPrevue: '2026-11-10T23:59:59.000Z',
    dateRetourPrevueAffichee: '10/11/2026',
    statut: 'EN_RETARD',
    notifications: [
      {
        id: 'notif_01',
        empruntId: 'emp_01',
        studentEmail: 'etudiant@usmba.ac.ma',
        studentNom: 'Étudiant USMBA',
        titreLivre: 'Modern Operating Systems (Systèmes d’exploitation)',
        dateEnvoi: '11/11/2026 à 08:30:00',
        type: 'RAPPEL_RETARD',
        message: "Rappel automatique : La date de retour de l'ouvrage 'Modern Operating Systems' était fixée au 10/11/2026. Merci de le restituer à l'accueil de la bibliothèque dans les plus brefs délais.",
        lu: false,
      },
    ],
  },
  {
    id: 'emp_02',
    bookId: 'b5',
    titreLivre: 'Design Patterns : Les 23 modèles de conception réutilisables',
    isbnLivre: '978-2744070907',
    coteLivre: 'GL-GOF-03',
    studentId: 'usr_etudiant_02',
    studentNom: 'Fatima Zahra Bennani',
    studentEmail: 'f.bennani@usmba.ac.ma',
    dateEmprunt: '2026-11-08T14:45:10.000Z',
    dateEmpruntAffichee: '08/11/2026 à 14:45:10',
    dateRetourPrevue: '2026-11-22T23:59:59.000Z',
    dateRetourPrevueAffichee: '22/11/2026',
    statut: 'EN_COURS',
    notifications: [],
  },
  {
    id: 'emp_03',
    bookId: 'b10',
    titreLivre: 'Chimie organique : Cours et exercices corrigés',
    isbnLivre: '978-2100725830',
    coteLivre: 'CHIM-ARN-02',
    studentId: 'usr_etudiant_03',
    studentNom: 'Mehdi Alami',
    studentEmail: 'm.alami@usmba.ac.ma',
    dateEmprunt: '2026-10-25T11:20:00.000Z',
    dateEmpruntAffichee: '25/10/2026 à 11:20:00',
    dateRetourPrevue: '2026-11-05T23:59:59.000Z',
    dateRetourPrevueAffichee: '05/11/2026',
    statut: 'EN_RETARD',
    notifications: [],
  },
];
