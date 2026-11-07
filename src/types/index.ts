export type ProjectCategory =
  | 'Semua'
  | 'Website Profil Perusahaan'
  | 'Toko Online (E-Commerce)'
  | 'Landing Page'
  | 'Website Bisnis & UMKM'
  | 'Aplikasi Web & Sistem'
  | 'Portal Berita & Media'
  | 'Website Portofolio'
  | 'Situs Web Bisnis'
  | 'Dasbor'
  | 'Perdagangan Elektronik'
  | 'Aplikasi Berbantuan AI'
  | 'Portal Lowongan Kerja'
  | 'Halaman Landing'
  | 'Situs Web Pendidikan'
  | 'Proyek Lainnya';

export type ProjectStatus = 'Selesai' | 'Pengembangan Aktif' | 'Konsep Teruji';

export type ServiceCategory =
  | 'Semua'
  | 'Pengembangan Web & AI'
  | 'IT Support & Hardware'
  | 'Jaringan & Server'
  | 'Keamanan & Backup'
  | 'Konsultasi IT';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  priceStartingFrom: string;
  turnaroundTime: string;
  features: string[];
  deliverables: string[];
  targetAudience: string;
  icon: 'code' | 'cpu' | 'network' | 'shield' | 'database' | 'headphones' | 'wrench' | 'globe';
  isPopular?: boolean;
  isActive: boolean;
  isDemoData: boolean;
  whatsappMessageTemplate?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  shortDescription: string;
  fullDescription: string;
  client?: string;
  purpose?: string;
  features?: string[];
  background?: string;
  problem?: string;
  solution?: string;
  role: string;
  aiWorkflow?: {
    ideation?: string;
    promptsSample?: string[];
    humanReviewAndRefinement?: string;
  };
  techStack: string[];
  status: ProjectStatus;
  year: string;
  thumbnail: string;
  gallery: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  isFeatured?: boolean;
  isDemoData: boolean;
}

export type TutorialDifficulty = 'Pemula' | 'Menengah' | 'Lanjutan';
export type TutorialCategory =
  | 'Semua'
  | 'Instalasi Windows'
  | 'Pemecahan Masalah Komputer'
  | 'Perangkat Keras & Peningkatan'
  | 'Jaringan'
  | 'Perangkat Lunak & Produktivitas'
  | 'Tips & Trik IT';

export interface TutorialStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: {
    language: string;
    code: string;
    label?: string;
  };
  note?: string;
  image?: string;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: TutorialCategory;
  difficulty: TutorialDifficulty;
  readTimeMinutes: number;
  publishedDate: string;
  updatedDate?: string;
  thumbnail: string;
  isFeatured?: boolean;
  isAiGenerated?: boolean;
  isDemoData: boolean;
  prerequisites: string[];
  toolsNeeded: string[];
  riskWarning?: {
    title: string;
    message: string;
    severity: 'warning' | 'danger';
  };
  tableOfContents: { id: string; title: string }[];
  steps: TutorialStep[];
  troubleshootingTips: { issue: string; resolution: string }[];
  faqs: { question: string; answer: string }[];
  conclusion: string;
  relatedTutorialSlugs?: string[];
}

export type ArticleCategory =
  | 'Semua'
  | 'Tren Teknologi'
  | 'Perangkat Keras & Gadget'
  | 'Keamanan Siber'
  | 'Sistem Operasi & Software'
  | 'Produktivitas IT';

export interface ArticleSection {
  heading: string;
  body: string;
  highlight?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  publishedDate: string;
  readTimeMinutes: number;
  thumbnail: string;
  author: string;
  tags: string[];
  sections: ArticleSection[];
  conclusion: string;
  isFeatured?: boolean;
  isAiGenerated?: boolean;
}

export type DesignCategory =
  | 'Semua'
  | 'Poster & Banner'
  | 'Logo & Branding'
  | 'Desain Media Sosial'
  | 'Kreatif Periklanan'
  | 'Desain Produk'
  | 'Karya Kreatif Lainnya';

export interface DesignItem {
  id: string;
  slug: string;
  title: string;
  category: DesignCategory;
  year: string;
  clientOrContext: string;
  role: string;
  toolsUsed: string[];
  shortDescription: string;
  fullDescription: string;
  mainImage: string;
  additionalImages?: string[];
  dimensions?: string;
  isFeatured?: boolean;
  isDemoData: boolean;
}

export interface SkillGroup {
  category: string;
  description: string;
  skills: string[];
}

export interface ToolItem {
  name: string;
  category: string;
  purpose: string;
}

export interface ValueItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface UserProfile {
  name: string;
  brandTitle: string;
  tagline: string;
  roleTitle: string;
  avatarUrl?: string;
  // Hero Section
  heroKicker?: string;
  heroHeadline: string;
  heroDescription: string;
  heroFocusAreas?: string[];
  heroImageUrl?: string;
  heroImageCaption?: string;
  heroImageYear?: string;
  heroImageTags?: string[];
  // Home CTA Banner
  ctaKicker?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaPrimaryBtnText?: string;
  ctaSecondaryBtnText?: string;
  // About & Bio
  aboutShort: string;
  aboutFull: string[];
  values: ValueItem[];
  learningJourney: TimelineItem[];
  // Contact & Social
  location: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  telegramUrl?: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  workingHours?: string;
  contactDescription?: string;
  // Footer
  footerDescription?: string;
  // Dynamic Social Media Links
  socialMedia?: SocialMediaItem[];
  // Skills & Tools
  skillGroups: SkillGroup[];
  tools: ToolItem[];
}

export interface SocialMediaItem {
  id: string;
  platform: string;
  url: string;
  usernameOrHandle?: string;
}

export type AdminRole = 'Super Admin' | 'Admin' | 'Admin Editor';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

