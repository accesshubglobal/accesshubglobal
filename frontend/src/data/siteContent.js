// Contenu statique du site (pas de données mock - les données viennent de MongoDB)
// Services
export const services = [
  {
    id: 1,
    icon: 'GraduationCap',
    title: "Études à l’étranger",
    description: "Programmes de bourses et autofinancés dans les meilleures universités en Chine, France, Canada, Australie et bien d’autres pays.",
    color: 'bg-blue-500',
    details: {
      intro: "Winner’s Consulting vous accompagne dans votre projet d’études à l’international. Nous travaillons avec des universités partenaires dans plusieurs pays pour vous offrir les meilleures opportunités académiques.",
      countries: [
        { name: 'Chine', flag: '🇨🇳', programs: 'Bourses CSC, MBBS, Ingénierie, Commerce, Langue chinoise' },
        { name: 'France', flag: '🇫🇷', programs: 'Campus France, Bourse Eiffel, Grandes Écoles, Universités publiques' },
        { name: 'Canada', flag: '🇨🇦', programs: 'Universités anglophones et francophones, Programmes co-op' },
        { name: 'Australie', flag: '🇦🇺', programs: "Universités du Group of Eight, Programmes d’ingénierie et IT" },
        { name: 'Autres pays', flag: '🌍', programs: 'Allemagne, Royaume-Uni, Japon, Corée du Sud, Turquie...' }
      ],
      features: [
        "Orientation et choix de programme personnalisé",
        "Constitution et vérification du dossier de candidature",
        "Soumission des candidatures auprès des universités",
        "Suivi jusqu’à l’obtention de la lettre d’admission",
        "Accompagnement pour les bourses (CSC, Eiffel, etc.)"
      ]
    }
  },
  {
    id: 2,
    icon: 'Stamp',
    title: 'Accompagnement Visa',
    description: "Visa études, tourisme, business, famille et travail en Chine. Assistance complète pour toutes vos démarches.",
    color: 'bg-purple-500',
    details: {
      intro: "Nous vous assistons dans l’obtention de tous types de visas pour la Chine. Notre expertise couvre l’ensemble des catégories de visas avec un taux de réussite élevé.",
      visaTypes: [
        { type: 'Visa Études (X1/X2)', desc: 'Pour les programmes universitaires de courte et longue durée' },
        { type: 'Visa Tourisme (L)', desc: 'Voyages touristiques individuels ou en groupe' },
        { type: 'Visa Business (M/F)', desc: "Voyages d’affaires, salons, conférences, négociations commerciales" },
        { type: 'Visa Famille (Q1/Q2/S1/S2)', desc: 'Regroupement familial, visite de proches résidant en Chine' },
        { type: 'Visa Travail (Z)', desc: "Permis de travail et visa pour emploi en Chine, incluant l’assistance pour le Work Permit" }
      ],
      features: [
        "Évaluation de votre éligibilité et choix du type de visa",
        "Préparation complète du dossier de demande",
        "Vérification et traduction des documents requis",
        "Prise de rendez-vous au centre de visa / ambassade",
        "Conseils pour l’entretien consulaire",
        "Suivi de la demande jusqu’à l’obtention du visa"
      ]
    }
  },
  {
    id: 3,
    icon: 'FileText',
    title: 'Traduction de documents',
    description: "Service de traduction certifiée de documents pour les études en Chine (français-chinois, anglais-chinois).",
    color: 'bg-red-500',
    details: {
      intro: "Notre service de traduction est spécialisé pour les dossiers d’admission en Chine. Nous fournissons des traductions certifiées conformes aux exigences des universités et autorités chinoises.",
      documentTypes: [
        "Diplômes et relevés de notes",
        "Actes de naissance et documents d’état civil",
        "Lettres de motivation et de recommandation",
        "Certificats médicaux",
        "Documents financiers (relevés bancaires, attestations)",
        "Contrats et documents juridiques"
      ],
      languages: ['Français → Chinois', 'Anglais → Chinois', 'Chinois → Français'],
      features: [
        "Traduction certifiée et notariée",
        "Conformité avec les exigences des universités chinoises",
        "Traducteurs natifs spécialisés",
        "Délai rapide (48h - 5 jours selon le volume)",
        "Révision et correction incluses"
      ]
    }
  },
  {
    id: 4,
    icon: 'Home',
    title: 'Recherche de Logement',
    description: "Trouvez le logement idéal près de votre université en Chine ou en France.",
    color: 'bg-green-500',
    details: {
      intro: "Nous vous aidons à trouver un logement sûr, confortable et abordable à proximité de votre campus. Notre réseau local facilite votre installation.",
      options: [
        { type: 'Résidence universitaire', desc: 'Chambres sur campus, option la plus économique' },
        { type: 'Appartement partagé', desc: "Colocation avec d’autres étudiants internationaux" },
        { type: 'Studio individuel', desc: "Pour ceux qui préfèrent plus d’intimité" },
        { type: "Famille d’accueil", desc: 'Immersion culturelle et linguistique' }
      ],
      features: [
        "Recherche personnalisée selon votre budget",
        "Vérification de la fiabilité du logement",
        "Aide à la signature du bail",
        "Accompagnement pour l’emménagement",
        "Assistance en cas de problème avec le propriétaire"
      ]
    }
  },
  {
    id: 5,
    icon: 'ShoppingBag',
    title: 'Guide Achat en Chine',
    description: "Assistance pour vos achats en Chine : sourcing produits, négociation fournisseurs, contrôle qualité et expédition.",
    color: 'bg-amber-500',
    details: {
      intro: "Profitez de notre présence en Chine pour vos projets d’achat et d’importation. Nous vous accompagnons de la recherche de produits jusqu’à l’expédition vers votre pays.",
      servicesList: [
        { title: 'Sourcing de produits', desc: 'Recherche de fournisseurs fiables sur les marchés et plateformes chinoises' },
        { title: 'Négociation', desc: 'Négociation des prix et conditions en chinois avec les fournisseurs' },
        { title: 'Contrôle qualité', desc: 'Inspection des produits avant expédition' },
        { title: 'Logistique', desc: "Organisation de l’expédition par voie maritime, aérienne ou terrestre" },
        { title: 'Accompagnement sur place', desc: 'Visite guidée des marchés de gros (Yiwu, Guangzhou, Shenzhen)' }
      ],
      features: [
        "Accompagnement personnalisé en français",
        "Réseau de fournisseurs vérifiés",
        "Gestion des commandes et du suivi",
        "Assistance pour les formalités douanières",
        "Service disponible à distance ou sur place"
      ]
    }
  },
  {
    id: 6,
    icon: 'FaCheckCircle',
    title: 'CHSI',
    description: "Vérification et certification CHSI de vos diplômes pour les études en Chine.",
    color: 'bg-indigo-500',
    details: {
      intro: "Le CHSI (China Higher Education Student Information) est la plateforme officielle de vérification des diplômes en Chine. Nous gérons entièrement le processus de certification pour vous.",
      features: [
        "Vérification de l’authenticité de vos diplômes",
        "Soumission du dossier sur la plateforme CHSI",
        "Suivi de la procédure de certification",
        "Traduction des documents si nécessaire",
        "Obtention du rapport de vérification officiel"
      ]
    }
  },
  {
    id: 7,
    icon: 'Users',
    title: 'Orientation Académique',
    description: "Conseils personnalisés pour choisir votre parcours et votre université.",
    color: 'bg-orange-500',
    details: {
      intro: "Notre service d’orientation vous aide à définir votre projet d’études en fonction de vos objectifs professionnels, votre profil académique et votre budget.",
      features: [
        "Bilan de compétences et d’intérêts",
        "Présentation des filières et débouchés",
        "Sélection d’universités adaptées à votre profil",
        "Comparaison des programmes et des coûts",
        "Plan d’action personnalisé avec calendrier"
      ]
    }
  },
  {
    id: 8,
    icon: 'Globe',
    title: 'Cours de Langues',
    description: "Préparation linguistique : Chinois, Français, Anglais avant votre départ.",
    color: 'bg-teal-500',
    details: {
      intro: "Préparez-vous linguistiquement avant votre départ grâce à nos cours adaptés à votre niveau et à votre destination.",
      languages: [
        { lang: 'Chinois (Mandarin)', levels: 'HSK 1 à HSK 6, conversation, chinois des affaires' },
        { lang: 'Français', levels: 'DELF/DALF, TCF, français académique' },
        { lang: 'Anglais', levels: 'IELTS, TOEFL, anglais académique et professionnel' }
      ],
      features: [
        "Cours individuels ou en petit groupe",
        "Professeurs natifs et certifiés",
        "Préparation aux examens officiels (HSK, DELF, IELTS)",
        "Cours en ligne ou en présentiel",
        "Programme adapté à votre emploi du temps"
      ]
    }
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
