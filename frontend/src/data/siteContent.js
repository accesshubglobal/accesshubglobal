// Contenu statique du site (pas de données mock - les données viennent de MongoDB)
// Services
export const services = [
  {
    id: 1,
    icon: 'GraduationCap',
    title: 'Études à l’étranger',
    description: 'Programmes de bourses et autofinancés dans les meilleures universités chinoises',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    icon: 'FileText',
    title: 'Traduction de documents',
    description: 'Accompagnement complet pour vos études dans les universités françaises',
    color: 'bg-red-500'
  },
  {
    id: 3,
    icon: 'Home',
    title: 'Recherche de Logement',
    description: 'Trouvez le logement idéal près de votre université',
    color: 'bg-green-500'
  },
  {
    id: 4,
    icon: 'Stamp',
    title: 'Accompagnement Visa',
    description: 'Assistance complète pour vos démarches de visa étudiant',
    color: 'bg-purple-500'
  },
  {
    id: 5,
    icon: 'FaCheckCircle',
    title: 'CHSI',
    description: 'Assistance complète pour vos démarches de visa étudiant',
    color: 'bg-purple-500'
  },
  {
    id: 6,
    icon: 'Users',
    title: 'Orientation Académique',
    description: 'Conseils personnalisés pour choisir votre parcours',
    color: 'bg-orange-500'
  },
  {
    id: 7,
    icon: 'Globe',
    title: 'Cours de Langues',
    description: 'Préparation linguistique: Chinois, Français, Anglais',
    color: 'bg-teal-500'
  }
];

// Statistics
export const stats = [
  { value: '5,000+', label: 'Étudiants Accompagnés' },
  { value: '150+', label: 'Universités Partenaires' },
  { value: '98%', label: 'Taux de Réussite' },
  { value: '15+', label: 'Années d\'Expérience' },
  { value: '540+', label: 'Offres de Bourse' }
];

// Navigation categories
export const categories = [
  'Licence',
  'Master',
  'Doctorat',
  'Médecine (MBBS)',
  'Ingénierie',
  'Commerce',
  'Langue Chinoise',
  'Langue Française',
  'Arts & Design',
  'Sciences'
];

// Quick filters
export const quickFilters = [
  { label: 'Bourses Complètes', isHot: true },
  { label: 'Programmes en Anglais' },
  { label: 'Programmes en Français' },
  { label: 'Sans Frais de Scolarité' },
  { label: 'Admission Rapide' },
  { label: 'Logement Inclus' }
];

// Partner universities - China
export const universitiesChina = [
  {
    id: 1,
    name: 'Université de Pékin',
    city: 'Beijing',
    country: 'Chine',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400',
    ranking: 'Top 20 Mondial',
    programs: 250,
    badges: ['Projet 985', 'Double First Class']
  },
  {
    id: 2,
    name: 'Université Tsinghua',
    city: 'Beijing',
    country: 'Chine',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
    ranking: 'Top 15 Mondial',
    programs: 280,
    badges: ['Projet 985', 'Projet 211']
  },
  {
    id: 3,
    name: 'Université Fudan',
    city: 'Shanghai',
    country: 'Chine',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
    ranking: 'Top 50 Mondial',
    programs: 200,
    badges: ['Projet 985']
  },
  {
    id: 4,
    name: 'Université Zhejiang',
    city: 'Hangzhou',
    country: 'Chine',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
    ranking: 'Top 60 Mondial',
    programs: 180,
    badges: ['Double First Class']
  }
];

// Partner universities - France
export const universitiesFrance = [
  {
    id: 1,
    name: 'Sorbonne Université',
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
    ranking: 'Top 50 Mondial',
    programs: 150,
    badges: ['Excellence']
  },
  {
    id: 2,
    name: 'École Polytechnique',
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400',
    ranking: 'Top 60 Mondial',
    programs: 80,
    badges: ['Grande École']
  },
  {
    id: 3,
    name: 'Université PSL',
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
    ranking: 'Top 30 Mondial',
    programs: 120,
    badges: ['Excellence', 'Recherche']
  },
  {
    id: 4,
    name: 'Sciences Po',
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400',
    ranking: 'Top 100 Mondial',
    programs: 60,
    badges: ['Sciences Politiques']
  }
];

// Scholarship programs
export const scholarshipPrograms = [
  {
    id: 1,
    title: 'Bourse CSC - Gouvernement Chinois',
    university: 'Toutes universités partenaires',
    coverage: 'Complète',
    level: 'Master / Doctorat',
    deadline: '15 Mars 2025',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
    benefits: ['Frais de scolarité', 'Logement', 'Allocation mensuelle', 'Assurance'],
    country: 'Chine'
  },
  {
    id: 2,
    title: 'Bourse Campus France',
    university: 'Universités françaises',
    coverage: 'Partielle à Complète',
    level: 'Licence / Master',
    deadline: '30 Avril 2025',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
    benefits: ['Frais de scolarité', 'Aide au logement', 'Couverture sociale'],
    country: 'France'
  },
  {
    id: 3,
    title: 'Bourse Provinciale Jiangsu',
    university: 'Universités du Jiangsu',
    coverage: 'Complète',
    level: 'Tous niveaux',
    deadline: '1er Mai 2025',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
    benefits: ['Frais de scolarité', 'Allocation mensuelle'],
    country: 'Chine'
  },
  {
    id: 4,
    title: 'Bourse Eiffel Excellence',
    university: 'Grandes Écoles françaises',
    coverage: 'Complète',
    level: 'Master / Doctorat',
    deadline: '10 Janvier 2025',
    image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400',
    benefits: ['Allocation mensuelle 1700€', 'Logement', 'Voyage'],
    country: 'France'
  }
];

// Housing options
export const housingOptions = [
  {
    id: 1,
    type: 'Résidence Universitaire',
    location: 'Sur campus',
    priceRange: '200-500 €/mois',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
    features: ['Sécurité 24h', 'Internet inclus', 'Proche des cours', 'Communauté étudiante'],
    available: true
  },
  {
    id: 2,
    type: 'Appartement Privé',
    location: 'Centre-ville',
    priceRange: '400-800 €/mois',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    features: ['Indépendance', 'Cuisine équipée', 'Plus d\'espace', 'Flexibilité'],
    available: true
  },
  {
    id: 3,
    type: 'Colocation',
    location: 'Quartier étudiant',
    priceRange: '250-450 €/mois',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    features: ['Prix réduit', 'Vie sociale', 'Partage des charges', 'Entraide'],
    available: true
  },
  {
    id: 4,
    type: 'Famille d\'Accueil',
    location: 'Quartier résidentiel',
    priceRange: '350-600 €/mois',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    features: ['Immersion culturelle', 'Repas inclus', 'Accompagnement', 'Sécurité'],
    available: true
  }
];

// Testimonials
export const testimonials = [
  {
    id: 1,
    name: 'Marie Dubois',
    country: 'France',
    program: 'Master en Commerce - Université de Pékin',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    text: 'Winner\'s Consulting m\'a accompagnée du début à la fin. J\'ai obtenu ma bourse CSC et trouvé un logement parfait à Beijing!',
    rating: 5
  },
  {
    id: 2,
    name: 'Ahmed Benali',
    country: 'Maroc',
    program: 'Doctorat - Sorbonne Université',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    text: 'Service exceptionnel! L\'équipe est très professionnelle et réactive. Je recommande vivement pour les études en France.',
    rating: 5
  },
  {
    id: 3,
    name: 'Sophie Chen',
    country: 'Belgique',
    program: 'Médecine (MBBS) - Université de Shanghai',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    text: 'Grâce à Winner\'s Consulting, j\'ai réalisé mon rêve d\'étudier la médecine en Chine. Merci pour tout!',
    rating: 5
  }
];

// Programs list
export const programsList = [
  {
    id: 1,
    title: 'Médecine (MBBS)',
    duration: '6 ans',
    language: 'Anglais',
    tuition: '30,000 - 50,000 CNY/an',
    country: 'Chine',
    universities: 45
  },
  {
    id: 2,
    title: 'Ingénierie Informatique',
    duration: '4 ans',
    language: 'Anglais/Chinois',
    tuition: '20,000 - 35,000 CNY/an',
    country: 'Chine',
    universities: 80
  },
  {
    id: 3,
    title: 'Business Administration',
    duration: '2 ans',
    language: 'Français',
    tuition: '8,000 - 15,000 €/an',
    country: 'France',
    universities: 35
  },
  {
    id: 4,
    title: 'Langue et Culture Chinoise',
    duration: '1-2 ans',
    language: 'Chinois',
    tuition: '10,000 - 20,000 CNY/an',
    country: 'Chine',
    universities: 100
  }
];

// FAQ
export const faqItems = [
  {
    question: 'Quels documents sont nécessaires pour postuler?',
    answer: 'Les documents requis varient selon le programme, mais généralement: passeport, diplômes, relevés de notes, certificat de langue, lettre de motivation, et lettres de recommandation.'
  },
  {
    question: 'Combien de temps prend le processus de candidature?',
    answer: 'Le processus complet prend généralement 2-4 mois, de la soumission du dossier à l\'obtention du visa.'
  },
  {
    question: 'Est-ce que Winner\'s Consulting aide pour le visa?',
    answer: 'Oui, nous offrons un accompagnement complet pour les démarches de visa, incluant la préparation des documents et les conseils pour l\'entretien.'
  },
  {
    question: 'Proposez-vous des cours de langue?',
    answer: 'Oui, nous proposons des cours de chinois, français et anglais pour préparer nos étudiants avant leur départ.'
  }
];
