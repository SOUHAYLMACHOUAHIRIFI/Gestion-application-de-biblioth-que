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
  couvertureUrl: string;
  disponible: boolean;
  description: string;
}

export interface UserCredentials {
  email: string;
  motDePasse: string;
}

export const DEFAULT_ADMIN = {
  id: 'usr_admin_01',
  email: 'admin@biblio.com',
  motDePasse: 'admin123',
  nom: 'Sarah Mansouri (Gestionnaire)',
  role: 'GESTIONNAIRE' as Role,
};

export const DEFAULT_STUDENT: User = {
  id: 'usr_etudiant_01',
  email: 'etudiant@biblio.com',
  nom: 'Alexandre Dupont',
  role: 'ETUDIANT',
};

export const mockBooks: Book[] = [
  {
    id: 'b1',
    isbn: '978-2070360024',
    titre: "L'Étranger",
    auteur: 'Albert Camus',
    categorie: 'Littérature classique',
    couvertureUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    description: "Une réflexion poignante sur l'absurde à travers le parcours de Meursault à Alger, chef-d'œuvre de la littérature du XXe siècle.",
  },
  {
    id: 'b2',
    isbn: '978-0132350884',
    titre: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    auteur: 'Robert C. Martin',
    categorie: 'Informatique & Tech',
    couvertureUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
    disponible: false,
    description: "Un guide indispensable pour tout développeur désireux d'écrire un code propre, lisible, testable et maintenable sur le long terme.",
  },
  {
    id: 'b3',
    isbn: '978-2253006329',
    titre: '1984',
    auteur: 'George Orwell',
    categorie: 'Science-Fiction & Dystopie',
    couvertureUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    description: "Dans une société totalitaire sous la surveillance constante de Big Brother, Winston Smith tente désespérément de résister au conditionnement mental.",
  },
  {
    id: 'b4',
    isbn: '978-2226442659',
    titre: 'Sapiens : Une brève histoire de l’humanité',
    auteur: 'Yuval Noah Harari',
    categorie: 'Histoire & Essais',
    couvertureUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    disponible: true,
    description: "Comment une espèce insignifiante de singes est devenue le maître absolu de la planète Terre. Une fresque historique et anthropologique captivante.",
  },
  {
    id: 'b5',
    isbn: '978-2070408504',
    titre: 'Le Petit Prince',
    auteur: 'Antoine de Saint-Exupéry',
    categorie: 'Conte & Philosophie',
    couvertureUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    disponible: false,
    description: "Un aviateur échoué dans le désert rencontre un petit garçon venu d'un astéroïde. Une fable poétique et universelle sur l'amour et l'amitié.",
  },
];
