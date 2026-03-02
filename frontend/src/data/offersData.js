// Complete offers database
export const allOffers = [
  // CHINA - Engineering
  {
    id: 'CHN-ENG-001',
    title: 'Génie Mécanique',
    titleEn: 'Mechanical Engineering',
    university: 'Université de Yanshan',
    universityEn: 'Yanshan University',
    city: 'Qinhuangdao',
    country: 'Chine',
    countryCode: 'CN',
    category: 'engineering',
    categoryLabel: 'Ingénierie',
    degree: 'Master',
    duration: '3 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '30 Mai 2025',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
    originalTuition: 24800,
    scholarshipTuition: 0,
    currency: 'CNY',
    scholarshipType: 'Type A - Bourse Complète',
    hasScholarship: true,
    isPartialScholarship: false,
    isSelfFinanced: false,
    isOnline: false,
    isNew: true,
    createdAt: '2025-01-15',
    badges: ['Bourse Complète', 'Populaire'],
    views: 15234,
    rating: 4.8,
    description: 'Programme de Master en Génie Mécanique avec bourse complète couvrant les frais de scolarité et logement.',
    requirements: {
      age: '18-35 ans',
      previousDegree: 'Licence en Ingénierie ou domaine connexe',
      gpa: 'Minimum 80/100 ou équivalent',
      language: 'IELTS 6.5+ ou TOEFL 85+ ou Duolingo 95+',
      otherRequirements: ['Lettre de motivation', '2 lettres de recommandation', 'CV détaillé']
    },
    scholarshipDetails: {
      tuitionCovered: true,
      accommodationCovered: true,
      monthlyAllowance: 1000,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 24800,
      scholarshipTuition: 0,
      accommodationDouble: 10600,
      accommodationSingle: 21200,
      accommodationScholarship: 0,
      registrationFee: 800,
      insuranceFee: 1000,
      applicationFee: 500
    },
    documents: [
      'Photo d\'identité',
      'Passeport (page ID)',
      'Relevés de notes',
      'Diplôme le plus élevé',
      'Certificat médical',
      'Casier judiciaire vierge',
      'Certificat de langue',
      'Relevé bancaire (+5000 USD)',
      'Plan d\'études',
      'CV',
      '2 Lettres de recommandation'
    ]
  },
  {
    id: 'CHN-ENG-002',
    title: 'Génie Électrique',
    titleEn: 'Electrical Engineering',
    university: 'Université de Yanshan',
    universityEn: 'Yanshan University',
    city: 'Qinhuangdao',
    country: 'Chine',
    countryCode: 'CN',
    category: 'engineering',
    categoryLabel: 'Ingénierie',
    degree: 'Master',
    duration: '3 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '30 Mai 2025',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    originalTuition: 24800,
    scholarshipTuition: 0,
    currency: 'CNY',
    scholarshipType: 'Type A - Bourse Complète',
    hasScholarship: true,
    isPartialScholarship: false,
    isSelfFinanced: false,
    isOnline: false,
    isNew: true,
    createdAt: '2025-01-10',
    badges: ['Bourse Complète'],
    views: 12890,
    rating: 4.7,
    description: 'Programme de Master en Génie Électrique avec couverture complète des frais.',
    requirements: {
      age: '18-35 ans',
      previousDegree: 'Licence en Génie Électrique ou domaine connexe',
      gpa: 'Minimum 80/100',
      language: 'IELTS 6.5+ ou TOEFL 85+',
      otherRequirements: ['Lettre de motivation', '2 lettres de recommandation']
    },
    scholarshipDetails: {
      tuitionCovered: true,
      accommodationCovered: true,
      monthlyAllowance: 1000,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 24800,
      scholarshipTuition: 0,
      accommodationDouble: 10600,
      accommodationSingle: 21200,
      accommodationScholarship: 0,
      registrationFee: 800,
      insuranceFee: 1000,
      applicationFee: 500
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes',
      'Diplôme',
      'Certificat médical',
      'Casier judiciaire',
      'Certificat de langue'
    ]
  },
  {
    id: 'CHN-ENG-003',
    title: 'Informatique et Technologie',
    titleEn: 'Computer Science and Technology',
    university: 'Université de Pékin',
    universityEn: 'Peking University',
    city: 'Beijing',
    country: 'Chine',
    countryCode: 'CN',
    category: 'engineering',
    categoryLabel: 'Ingénierie',
    degree: 'Master',
    duration: '2 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '15 Mars 2025',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    originalTuition: 45000,
    scholarshipTuition: 0,
    currency: 'CNY',
    scholarshipType: 'Bourse CSC',
    hasScholarship: true,
    isPartialScholarship: false,
    isSelfFinanced: false,
    isOnline: false,
    isNew: true,
    createdAt: '2025-01-20',
    badges: ['Bourse CSC', 'Top Université', 'Populaire'],
    views: 28450,
    rating: 4.9,
    description: 'Programme prestigieux en Computer Science à l\'Université de Pékin avec bourse gouvernementale.',
    requirements: {
      age: '18-35 ans',
      previousDegree: 'Licence en Informatique',
      gpa: 'Minimum 85/100',
      language: 'IELTS 7.0+ ou TOEFL 95+',
      otherRequirements: ['Publications académiques appréciées', 'Expérience en recherche']
    },
    scholarshipDetails: {
      tuitionCovered: true,
      accommodationCovered: true,
      monthlyAllowance: 3000,
      insuranceCovered: true
    },
    fees: {
      originalTuition: 45000,
      scholarshipTuition: 0,
      accommodationDouble: 15000,
      accommodationSingle: 25000,
      accommodationScholarship: 0,
      registrationFee: 1000,
      insuranceFee: 800,
      applicationFee: 600
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes',
      'Diplôme',
      'Certificat médical',
      'Casier judiciaire',
      'IELTS/TOEFL',
      'Plan d\'études détaillé',
      'CV académique',
      '2 Lettres de recommandation'
    ]
  },
  // CHINA - Medicine - PARTIAL SCHOLARSHIP
  {
    id: 'CHN-MED-001',
    title: 'Médecine (MBBS)',
    titleEn: 'Medicine (MBBS)',
    university: 'Université de Médecine de Shanghai',
    universityEn: 'Shanghai Medical University',
    city: 'Shanghai',
    country: 'Chine',
    countryCode: 'CN',
    category: 'medicine',
    categoryLabel: 'Médecine',
    degree: 'Bachelor (MBBS)',
    duration: '6 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '30 Juin 2025',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
    originalTuition: 45000,
    scholarshipTuition: 35000,
    currency: 'CNY',
    scholarshipType: 'Bourse Partielle',
    hasScholarship: true,
    isPartialScholarship: true,
    isSelfFinanced: false,
    isOnline: false,
    isNew: false,
    createdAt: '2024-11-15',
    badges: ['MBBS', 'Bourse Partielle', 'Top Ranking'],
    views: 45670,
    rating: 4.8,
    description: 'Programme MBBS en anglais reconnu par l\'OMS et le MCI.',
    requirements: {
      age: '18-25 ans',
      previousDegree: 'Baccalauréat scientifique',
      gpa: 'Minimum 70% en Biologie, Chimie et Physique',
      language: 'IELTS 6.0+ ou équivalent',
      otherRequirements: ['Certificat de santé', 'Pas de daltonisme']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 45000,
      scholarshipTuition: 35000,
      accommodationDouble: 8000,
      accommodationSingle: 15000,
      accommodationScholarship: null,
      registrationFee: 500,
      insuranceFee: 800,
      applicationFee: 500
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes du lycée',
      'Diplôme du Baccalauréat',
      'Certificat médical complet',
      'Casier judiciaire',
      'Certificat de langue'
    ]
  },
  // CHINA - Chinese Language - SELF FINANCED
  {
    id: 'CHN-LANG-001',
    title: 'Langue Chinoise - Niveau Débutant',
    titleEn: 'Chinese Language - Beginner Level',
    university: 'Université de Nanjing',
    universityEn: 'Nanjing University',
    city: 'Nanjing',
    country: 'Chine',
    countryCode: 'CN',
    category: 'chinese',
    categoryLabel: 'Langue Chinoise',
    degree: 'Non-diplômant',
    duration: '1 an',
    teachingLanguage: 'Chinois',
    intake: 'Automne 2025',
    deadline: '15 Juillet 2025',
    image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=600',
    originalTuition: 18000,
    scholarshipTuition: 18000,
    currency: 'CNY',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: false,
    isNew: false,
    createdAt: '2024-10-20',
    badges: ['Débutant', 'Auto-financé'],
    views: 23400,
    rating: 4.6,
    description: 'Programme intensif de langue chinoise pour débutants avec préparation HSK.',
    requirements: {
      age: '18-45 ans',
      previousDegree: 'Baccalauréat minimum',
      gpa: 'Non requis',
      language: 'Aucune connaissance du chinois requise',
      otherRequirements: []
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 18000,
      scholarshipTuition: 18000,
      accommodationDouble: 6000,
      accommodationSingle: 12000,
      registrationFee: 400,
      insuranceFee: 600,
      applicationFee: 300
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Diplôme le plus élevé',
      'Certificat médical'
    ]
  },
  // CHINA - Management - PARTIAL
  {
    id: 'CHN-MGT-001',
    title: 'Administration des Affaires',
    titleEn: 'Business Administration',
    university: 'Université Tsinghua',
    universityEn: 'Tsinghua University',
    city: 'Beijing',
    country: 'Chine',
    countryCode: 'CN',
    category: 'management',
    categoryLabel: 'Gestion',
    degree: 'MBA',
    duration: '2 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '1er Avril 2025',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600',
    originalTuition: 180000,
    scholarshipTuition: 90000,
    currency: 'CNY',
    scholarshipType: 'Bourse Partielle 50%',
    hasScholarship: true,
    isPartialScholarship: true,
    isSelfFinanced: false,
    isOnline: false,
    isNew: false,
    createdAt: '2024-09-15',
    badges: ['MBA', 'Bourse Partielle', 'Top 10 Mondial'],
    views: 34500,
    rating: 4.9,
    description: 'MBA prestigieux à Tsinghua, classé parmi les meilleurs au monde.',
    requirements: {
      age: '25-40 ans',
      previousDegree: 'Licence + 3 ans d\'expérience professionnelle',
      gpa: 'Minimum 3.0/4.0',
      language: 'GMAT 680+ et IELTS 7.0+',
      otherRequirements: ['Entretien obligatoire', 'Essais de candidature']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 180000,
      scholarshipTuition: 90000,
      accommodationDouble: 20000,
      accommodationSingle: 35000,
      registrationFee: 1500,
      insuranceFee: 1000,
      applicationFee: 800
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes universitaires',
      'Diplôme de Licence',
      'Score GMAT',
      'IELTS/TOEFL',
      'CV professionnel',
      '3 Lettres de recommandation',
      'Essais de motivation'
    ]
  },
  // FRANCE - Engineering - FULL SCHOLARSHIP
  {
    id: 'FR-ENG-001',
    title: 'Ingénierie Informatique',
    titleEn: 'Computer Engineering',
    university: 'École Polytechnique',
    universityEn: 'École Polytechnique',
    city: 'Palaiseau',
    country: 'France',
    countryCode: 'FR',
    category: 'engineering',
    categoryLabel: 'Ingénierie',
    degree: 'Master',
    duration: '2 ans',
    teachingLanguage: 'Français/Anglais',
    intake: 'Automne 2025',
    deadline: '15 Janvier 2025',
    image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=600',
    originalTuition: 15000,
    scholarshipTuition: 0,
    currency: 'EUR',
    scholarshipType: 'Bourse Eiffel',
    hasScholarship: true,
    isPartialScholarship: false,
    isSelfFinanced: false,
    isOnline: false,
    isNew: true,
    createdAt: '2025-01-05',
    badges: ['Grande École', 'Bourse Complète', 'Excellence'],
    views: 19800,
    rating: 4.9,
    description: 'Programme d\'ingénierie de haut niveau avec possibilité de bourse Eiffel.',
    requirements: {
      age: '18-30 ans',
      previousDegree: 'Licence en Ingénierie',
      gpa: 'Top 10% de la promotion',
      language: 'Français B2 ou Anglais C1',
      otherRequirements: ['Lettre de motivation', 'Projet de recherche']
    },
    scholarshipDetails: {
      tuitionCovered: true,
      accommodationCovered: false,
      monthlyAllowance: 1181,
      insuranceCovered: true
    },
    fees: {
      originalTuition: 15000,
      scholarshipTuition: 0,
      accommodationDouble: 5000,
      accommodationSingle: 8000,
      registrationFee: 300,
      insuranceFee: 0,
      applicationFee: 0
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes',
      'Diplôme',
      'Certificat de langue',
      'CV',
      'Lettre de motivation',
      '2 Lettres de recommandation'
    ]
  },
  // FRANCE - Management - PARTIAL
  {
    id: 'FR-MGT-001',
    title: 'Commerce International',
    titleEn: 'International Business',
    university: 'HEC Paris',
    universityEn: 'HEC Paris',
    city: 'Jouy-en-Josas',
    country: 'France',
    countryCode: 'FR',
    category: 'management',
    categoryLabel: 'Gestion',
    degree: 'Master',
    duration: '2 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '1er Mars 2025',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
    originalTuition: 45000,
    scholarshipTuition: 22500,
    currency: 'EUR',
    scholarshipType: 'Bourse HEC',
    hasScholarship: true,
    isPartialScholarship: true,
    isSelfFinanced: false,
    isOnline: false,
    isNew: false,
    createdAt: '2024-12-01',
    badges: ['Grande École', 'Bourse Partielle', 'Top Business School'],
    views: 27600,
    rating: 4.9,
    description: 'Programme de management international de renommée mondiale.',
    requirements: {
      age: '21-35 ans',
      previousDegree: 'Licence (tout domaine)',
      gpa: 'Excellent dossier académique',
      language: 'GMAT 700+ et IELTS 7.0+',
      otherRequirements: ['Entretien', 'Essais']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 45000,
      scholarshipTuition: 22500,
      accommodationDouble: 8000,
      accommodationSingle: 12000,
      registrationFee: 500,
      insuranceFee: 500,
      applicationFee: 150
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes',
      'Diplôme',
      'GMAT',
      'IELTS/TOEFL',
      'CV',
      'Lettre de motivation',
      '2 Lettres de recommandation'
    ]
  },
  // FRANCE - French Language - SELF FINANCED
  {
    id: 'FR-LANG-001',
    title: 'Langue Française - FLE',
    titleEn: 'French as Foreign Language',
    university: 'Sorbonne Université',
    universityEn: 'Sorbonne University',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    category: 'french',
    categoryLabel: 'Langue Française',
    degree: 'Certificat',
    duration: '1 semestre',
    teachingLanguage: 'Français',
    intake: 'Automne 2025',
    deadline: '30 Juin 2025',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600',
    originalTuition: 3500,
    scholarshipTuition: 3500,
    currency: 'EUR',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: false,
    isNew: false,
    createdAt: '2024-08-15',
    badges: ['FLE', 'Auto-financé', 'Sorbonne'],
    views: 15400,
    rating: 4.7,
    description: 'Programme intensif de français langue étrangère à la Sorbonne.',
    requirements: {
      age: '18-60 ans',
      previousDegree: 'Baccalauréat',
      gpa: 'Non requis',
      language: 'Niveau A1 minimum',
      otherRequirements: []
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 3500,
      scholarshipTuition: 3500,
      accommodationDouble: 4000,
      accommodationSingle: 7000,
      registrationFee: 100,
      insuranceFee: 200,
      applicationFee: 50
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Diplôme du Baccalauréat',
      'Test de niveau de français'
    ]
  },
  // CHINA - Science - FULL
  {
    id: 'CHN-SCI-001',
    title: 'Physique Appliquée',
    titleEn: 'Applied Physics',
    university: 'Université Fudan',
    universityEn: 'Fudan University',
    city: 'Shanghai',
    country: 'Chine',
    countryCode: 'CN',
    category: 'science',
    categoryLabel: 'Sciences',
    degree: 'Doctorat',
    duration: '4 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '15 Février 2025',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600',
    originalTuition: 40000,
    scholarshipTuition: 0,
    currency: 'CNY',
    scholarshipType: 'Bourse CSC',
    hasScholarship: true,
    isPartialScholarship: false,
    isSelfFinanced: false,
    isOnline: false,
    isNew: true,
    createdAt: '2025-01-18',
    badges: ['Bourse Complète', 'Doctorat', 'Recherche'],
    views: 8900,
    rating: 4.8,
    description: 'Programme doctoral en physique avec financement complet.',
    requirements: {
      age: '18-35 ans',
      previousDegree: 'Master en Physique',
      gpa: 'Minimum 85/100',
      language: 'IELTS 6.5+',
      otherRequirements: ['Publications requises', 'Proposition de recherche']
    },
    scholarshipDetails: {
      tuitionCovered: true,
      accommodationCovered: true,
      monthlyAllowance: 3500,
      insuranceCovered: true
    },
    fees: {
      originalTuition: 40000,
      scholarshipTuition: 0,
      accommodationDouble: 12000,
      accommodationSingle: 20000,
      accommodationScholarship: 0,
      registrationFee: 800,
      insuranceFee: 800,
      applicationFee: 600
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes Master',
      'Diplôme de Master',
      'Publications',
      'Proposition de recherche',
      'CV académique',
      '3 Lettres de recommandation'
    ]
  },
  // FRANCE - Law - FULL
  {
    id: 'FR-LAW-001',
    title: 'Droit International',
    titleEn: 'International Law',
    university: 'Sciences Po Paris',
    universityEn: 'Sciences Po Paris',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    category: 'law',
    categoryLabel: 'Droit',
    degree: 'Master',
    duration: '2 ans',
    teachingLanguage: 'Anglais/Français',
    intake: 'Automne 2025',
    deadline: '15 Janvier 2025',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    originalTuition: 14500,
    scholarshipTuition: 0,
    currency: 'EUR',
    scholarshipType: 'Bourse Émile Boutmy',
    hasScholarship: true,
    isPartialScholarship: false,
    isSelfFinanced: false,
    isOnline: false,
    isNew: true,
    createdAt: '2025-01-12',
    badges: ['Sciences Po', 'Bourse Complète', 'Droit'],
    views: 12300,
    rating: 4.8,
    description: 'Master en droit international à Sciences Po avec possibilité de bourse.',
    requirements: {
      age: '18-30 ans',
      previousDegree: 'Licence en Droit',
      gpa: 'Excellent dossier',
      language: 'Français B2 et Anglais C1',
      otherRequirements: ['CV', 'Lettre de motivation', 'Projet professionnel']
    },
    scholarshipDetails: {
      tuitionCovered: true,
      accommodationCovered: false,
      monthlyAllowance: 700,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 14500,
      scholarshipTuition: 0,
      accommodationDouble: 5000,
      accommodationSingle: 9000,
      registrationFee: 200,
      insuranceFee: 200,
      applicationFee: 0
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes',
      'Diplôme de Licence',
      'Certificats de langue',
      'CV',
      'Lettre de motivation'
    ]
  },
  // ONLINE COURSES
  {
    id: 'ONLINE-001',
    title: 'Chinois Mandarin - En Ligne',
    titleEn: 'Mandarin Chinese - Online',
    university: 'Beijing Language University',
    universityEn: 'Beijing Language University',
    city: 'En ligne',
    country: 'Chine',
    countryCode: 'CN',
    category: 'chinese',
    categoryLabel: 'Langue Chinoise',
    degree: 'Certificat',
    duration: '6 mois',
    teachingLanguage: 'Chinois/Anglais',
    intake: 'Flexible',
    deadline: 'Inscription continue',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    originalTuition: 5000,
    scholarshipTuition: 5000,
    currency: 'CNY',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: true,
    isNew: true,
    createdAt: '2025-01-22',
    badges: ['En Ligne', 'Flexible', 'Certificat'],
    views: 8900,
    rating: 4.5,
    description: 'Cours de chinois mandarin entièrement en ligne avec professeurs natifs.',
    requirements: {
      age: 'Tous âges',
      previousDegree: 'Aucun',
      gpa: 'Non requis',
      language: 'Anglais basique recommandé',
      otherRequirements: ['Connexion internet stable', 'Ordinateur ou tablette']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 5000,
      scholarshipTuition: 5000,
      accommodationDouble: 0,
      accommodationSingle: 0,
      registrationFee: 200,
      insuranceFee: 0,
      applicationFee: 100
    },
    documents: [
      'Photo d\'identité',
      'Passeport ou carte d\'identité'
    ]
  },
  {
    id: 'ONLINE-002',
    title: 'MBA en Ligne - Business International',
    titleEn: 'Online MBA - International Business',
    university: 'INSEAD Online',
    universityEn: 'INSEAD Online',
    city: 'En ligne',
    country: 'France',
    countryCode: 'FR',
    category: 'management',
    categoryLabel: 'Gestion',
    degree: 'MBA',
    duration: '18 mois',
    teachingLanguage: 'Anglais',
    intake: 'Janvier / Septembre',
    deadline: '30 Novembre 2025',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
    originalTuition: 35000,
    scholarshipTuition: 35000,
    currency: 'EUR',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: true,
    isNew: true,
    createdAt: '2025-01-25',
    badges: ['En Ligne', 'MBA', 'INSEAD'],
    views: 12500,
    rating: 4.7,
    description: 'Programme MBA en ligne de l\'INSEAD, flexibilité totale pour professionnels.',
    requirements: {
      age: '25+',
      previousDegree: 'Licence + 5 ans expérience',
      gpa: 'Bon dossier académique',
      language: 'Anglais C1',
      otherRequirements: ['GMAT/GRE recommandé', 'Entretien vidéo']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 35000,
      scholarshipTuition: 35000,
      accommodationDouble: 0,
      accommodationSingle: 0,
      registrationFee: 300,
      insuranceFee: 0,
      applicationFee: 200
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'CV professionnel',
      'Diplômes',
      'Lettre de motivation',
      'Recommandations'
    ]
  },
  {
    id: 'ONLINE-003',
    title: 'Français Langue Étrangère - En Ligne',
    titleEn: 'French as Foreign Language - Online',
    university: 'Alliance Française',
    universityEn: 'Alliance Française',
    city: 'En ligne',
    country: 'France',
    countryCode: 'FR',
    category: 'french',
    categoryLabel: 'Langue Française',
    degree: 'Certificat DELF/DALF',
    duration: '3-12 mois',
    teachingLanguage: 'Français',
    intake: 'Flexible',
    deadline: 'Inscription continue',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600',
    originalTuition: 1500,
    scholarshipTuition: 1500,
    currency: 'EUR',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: true,
    isNew: true,
    createdAt: '2025-01-20',
    badges: ['En Ligne', 'DELF/DALF', 'Flexible'],
    views: 7800,
    rating: 4.6,
    description: 'Cours de français en ligne avec préparation aux examens DELF/DALF.',
    requirements: {
      age: 'Tous âges',
      previousDegree: 'Aucun',
      gpa: 'Non requis',
      language: 'Aucune connaissance requise (débutant accepté)',
      otherRequirements: ['Connexion internet']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 1500,
      scholarshipTuition: 1500,
      accommodationDouble: 0,
      accommodationSingle: 0,
      registrationFee: 50,
      insuranceFee: 0,
      applicationFee: 0
    },
    documents: [
      'Photo d\'identité',
      'Pièce d\'identité'
    ]
  },
  {
    id: 'ONLINE-004',
    title: 'Data Science & Intelligence Artificielle',
    titleEn: 'Data Science & Artificial Intelligence',
    university: 'Coursera - Université de Pékin',
    universityEn: 'Coursera - Peking University',
    city: 'En ligne',
    country: 'Chine',
    countryCode: 'CN',
    category: 'engineering',
    categoryLabel: 'Ingénierie',
    degree: 'Certificat Professionnel',
    duration: '6 mois',
    teachingLanguage: 'Anglais',
    intake: 'Flexible',
    deadline: 'Inscription continue',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600',
    originalTuition: 3000,
    scholarshipTuition: 3000,
    currency: 'CNY',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: true,
    isNew: true,
    createdAt: '2025-01-28',
    badges: ['En Ligne', 'IA', 'Certificat'],
    views: 15600,
    rating: 4.8,
    description: 'Certificat professionnel en Data Science et IA de l\'Université de Pékin.',
    requirements: {
      age: 'Tous âges',
      previousDegree: 'Licence recommandée',
      gpa: 'Non requis',
      language: 'Anglais intermédiaire',
      otherRequirements: ['Connaissances de base en programmation']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 3000,
      scholarshipTuition: 3000,
      accommodationDouble: 0,
      accommodationSingle: 0,
      registrationFee: 0,
      insuranceFee: 0,
      applicationFee: 0
    },
    documents: [
      'Inscription en ligne uniquement'
    ]
  },
  // More SELF-FINANCED
  {
    id: 'CHN-SELF-001',
    title: 'Commerce et Marketing',
    titleEn: 'Business and Marketing',
    university: 'Université de Shanghai',
    universityEn: 'Shanghai University',
    city: 'Shanghai',
    country: 'Chine',
    countryCode: 'CN',
    category: 'management',
    categoryLabel: 'Gestion',
    degree: 'Licence',
    duration: '4 ans',
    teachingLanguage: 'Anglais',
    intake: 'Automne 2025',
    deadline: '30 Juin 2025',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    originalTuition: 28000,
    scholarshipTuition: 28000,
    currency: 'CNY',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: false,
    isNew: false,
    createdAt: '2024-11-01',
    badges: ['Auto-financé', 'Anglais'],
    views: 9800,
    rating: 4.4,
    description: 'Programme de licence en commerce international à Shanghai.',
    requirements: {
      age: '18-25 ans',
      previousDegree: 'Baccalauréat',
      gpa: 'Minimum 60%',
      language: 'IELTS 5.5+',
      otherRequirements: []
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 28000,
      scholarshipTuition: 28000,
      accommodationDouble: 8000,
      accommodationSingle: 15000,
      registrationFee: 500,
      insuranceFee: 800,
      applicationFee: 400
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Relevés de notes',
      'Diplôme du Baccalauréat',
      'Certificat de langue'
    ]
  },
  {
    id: 'FR-SELF-001',
    title: 'Architecture et Design',
    titleEn: 'Architecture and Design',
    university: 'École des Beaux-Arts',
    universityEn: 'École des Beaux-Arts',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    category: 'arts',
    categoryLabel: 'Arts & Design',
    degree: 'Master',
    duration: '2 ans',
    teachingLanguage: 'Français',
    intake: 'Automne 2025',
    deadline: '15 Avril 2025',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
    originalTuition: 12000,
    scholarshipTuition: 12000,
    currency: 'EUR',
    scholarshipType: 'Auto-financement',
    hasScholarship: false,
    isPartialScholarship: false,
    isSelfFinanced: true,
    isOnline: false,
    isNew: false,
    createdAt: '2024-10-15',
    badges: ['Auto-financé', 'Arts', 'Paris'],
    views: 6700,
    rating: 4.6,
    description: 'Master en architecture et design à l\'École des Beaux-Arts de Paris.',
    requirements: {
      age: '18-35 ans',
      previousDegree: 'Licence en Architecture ou Design',
      gpa: 'Bon dossier',
      language: 'Français B2',
      otherRequirements: ['Portfolio', 'Entretien']
    },
    scholarshipDetails: {
      tuitionCovered: false,
      accommodationCovered: false,
      monthlyAllowance: 0,
      insuranceCovered: false
    },
    fees: {
      originalTuition: 12000,
      scholarshipTuition: 12000,
      accommodationDouble: 5000,
      accommodationSingle: 9000,
      registrationFee: 300,
      insuranceFee: 300,
      applicationFee: 100
    },
    documents: [
      'Photo d\'identité',
      'Passeport',
      'Diplôme',
      'Portfolio (min 15 projets)',
      'Certificat de langue',
      'CV'
    ]
  }
];

// Categories mapping
export const categories = [
  { id: 'chinese', name: 'Langue Chinoise', icon: '🇨🇳' },
  { id: 'french', name: 'Langue Française', icon: '🇫🇷' },
  { id: 'economics', name: 'Économie', icon: '📊' },
  { id: 'management', name: 'Gestion', icon: '💼' },
  { id: 'engineering', name: 'Ingénierie', icon: '⚙️' },
  { id: 'science', name: 'Sciences', icon: '🔬' },
  { id: 'medicine', name: 'Médecine', icon: '🏥' },
  { id: 'literature', name: 'Littérature', icon: '📚' },
  { id: 'law', name: 'Droit', icon: '⚖️' },
  { id: 'arts', name: 'Arts & Design', icon: '🎨' },
  { id: 'foundation', name: 'Cours Préparatoires', icon: '📝' }
];

// Quick filters - UPDATED
export const quickFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'new', label: 'Nouveauté' },
  { id: 'fullScholarship', label: 'Bourse Complète' },
  { id: 'partialScholarship', label: 'Bourse Partielle' },
  { id: 'selfFinanced', label: 'Auto-financement' },
  { id: 'online', label: 'Cours en Ligne' }
];

// Search function
export const searchOffers = (query, categoryFilter = null, quickFilter = null) => {
  let results = [...allOffers];
  
  // Search by query
  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase().trim();
    results = results.filter(offer => 
      offer.title.toLowerCase().includes(searchTerm) ||
      offer.titleEn.toLowerCase().includes(searchTerm) ||
      offer.university.toLowerCase().includes(searchTerm) ||
      offer.universityEn.toLowerCase().includes(searchTerm) ||
      offer.city.toLowerCase().includes(searchTerm) ||
      offer.categoryLabel.toLowerCase().includes(searchTerm) ||
      offer.degree.toLowerCase().includes(searchTerm) ||
      offer.country.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by category
  if (categoryFilter && categoryFilter !== 'all') {
    results = results.filter(offer => offer.category === categoryFilter);
  }
  
  // Filter by quick filter
  if (quickFilter && quickFilter !== 'all') {
    switch (quickFilter) {
      case 'new':
        // Filter by isNew flag and sort by creation date
        results = results
          .filter(offer => offer.isNew)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'fullScholarship':
        // Full scholarship = has scholarship AND tuition is 0
        results = results.filter(offer => 
          offer.hasScholarship && !offer.isPartialScholarship && offer.scholarshipTuition === 0
        );
        break;
      case 'partialScholarship':
        // Partial scholarship = has scholarship but tuition > 0
        results = results.filter(offer => offer.isPartialScholarship);
        break;
      case 'selfFinanced':
        // Self-financed = no scholarship
        results = results.filter(offer => offer.isSelfFinanced);
        break;
      case 'online':
        // Online courses
        results = results.filter(offer => offer.isOnline);
        break;
      default:
        break;
    }
  }
  
  return results;
};
