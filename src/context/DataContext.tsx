import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Project, Tutorial, DesignItem, Article, ServiceItem, UserProfile, SkillGroup, ToolItem, AdminUser } from '../types';
import { projectsData as initialProjects } from '../data/projects';
import { tutorialsData as initialTutorials } from '../data/tutorials';
import { designsData as initialDesigns } from '../data/designs';
import { articlesData as initialArticles } from '../data/articles';
import { servicesData as initialServices } from '../data/services';
import { profileData as initialProfile } from '../data/profile';

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'super-admin-risa7lavan',
    username: 'risa7lavan',
    password: 'Almahyra7$',
    name: 'Super Admin',
    role: 'Super Admin',
    createdAt: new Date().toISOString()
  }
];

interface DataContextType {
  projects: Project[];
  services: ServiceItem[];
  tutorials: Tutorial[];
  articles: Article[];
  designs: DesignItem[];
  profile: UserProfile;
  isAdminLoggedIn: boolean;
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  login: (user: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // Admin User Actions
  addAdminUser: (item: Omit<AdminUser, 'id' | 'createdAt'>) => { success: boolean; message?: string; user?: AdminUser };
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => { success: boolean; message?: string };
  deleteAdminUser: (id: string) => { success: boolean; message?: string };
  // Project Actions
  addProject: (item: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Service Actions
  addService: (item: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  // Tutorial Actions
  addTutorial: (item: Omit<Tutorial, 'id'>) => Tutorial;
  updateTutorial: (id: string, updates: Partial<Tutorial>) => void;
  deleteTutorial: (id: string) => void;
  // Article Actions
  addArticle: (item: Omit<Article, 'id'>) => Article;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  // Design Actions
  addDesign: (item: Omit<DesignItem, 'id'>) => DesignItem;
  updateDesign: (id: string, updates: Partial<DesignItem>) => void;
  deleteDesign: (id: string) => void;
  // Profile & Skills Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  addSkillGroup: (group: SkillGroup) => void;
  updateSkillGroup: (index: number, group: SkillGroup) => void;
  deleteSkillGroup: (index: number) => void;
  addTool: (tool: ToolItem) => void;
  updateTool: (index: number, tool: ToolItem) => void;
  deleteTool: (index: number) => void;
  // Backup & Reset
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };
  // Database & Supabase Persistence
  syncStatus: 'synced' | 'saving' | 'error' | 'offline' | 'unconfigured';
  lastSavedAt: Date | null;
  syncErrorMessage: string | null;
  saveToDatabase: (overrideData?: any) => Promise<{ success: boolean; error?: string }>;
  refreshFromDatabase: () => Promise<boolean>;
}

const STORAGE_KEYS = {
  PROJECTS: 'rkd_content_projects_v2',
  SERVICES: 'rkd_content_services_v1',
  TUTORIALS: 'rkd_content_tutorials_v1',
  ARTICLES: 'rkd_content_articles_v1',
  DESIGNS: 'rkd_content_designs_v1',
  PROFILE: 'rkd_content_profile_v1',
  AUTH: 'rkd_admin_auth_v1',
  ADMIN_USERS: 'rkd_admin_users_v1'
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return stored ? JSON.parse(stored) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return stored ? JSON.parse(stored) : initialServices;
    } catch {
      return initialServices;
    }
  });

  // Tutorials State
  const [tutorials, setTutorials] = useState<Tutorial[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TUTORIALS);
      return stored ? JSON.parse(stored) : initialTutorials;
    } catch {
      return initialTutorials;
    }
  });

  // Articles State
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return stored ? JSON.parse(stored) : initialArticles;
    } catch {
      return initialArticles;
    }
  });

  // Designs State
  const [designs, setDesigns] = useState<DesignItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      return stored ? JSON.parse(stored) : initialDesigns;
    } catch {
      return initialDesigns;
    }
  });

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name === 'Alex Pratama') {
          const merged = { ...parsed, ...initialProfile };
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return { ...initialProfile, ...parsed };
      }
      return initialProfile;
    } catch {
      return initialProfile;
    }
  });

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasRisa = parsed.some((u: AdminUser) => u && u.username?.toLowerCase() === 'risa7lavan');
          if (!hasRisa) {
            const updated = [
              initialAdminUsers[0],
              ...parsed.filter((u: AdminUser) => u && u.username !== 'admin' && u.username !== 'owner')
            ];
            try {
              localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return parsed;
        }
      }
      return initialAdminUsers;
    } catch {
      return initialAdminUsers;
    }
  });

  // Current Logged-in Admin Info
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const authUser = sessionStorage.getItem(STORAGE_KEYS.AUTH);
      if (authUser) {
        const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
        const list: AdminUser[] = stored ? JSON.parse(stored) : initialAdminUsers;
        const found = list.find((u) => u.username.toLowerCase() === authUser.toLowerCase());
        return found || list[0] || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try { return Boolean(sessionStorage.getItem(STORAGE_KEYS.AUTH)); } catch { return false; }
  });
  const [remoteReady, setRemoteReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'offline' | 'unconfigured'>('synced');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  // Synchronous mirror of the latest state to prevent stale closures on Save
  const latestStateRef = useRef({
    profile,
    projects,
    services,
    tutorials,
    articles,
    designs,
    adminUsers
  });
  latestStateRef.current = {
    profile,
    projects,
    services,
    tutorials,
    articles,
    designs,
    adminUsers
  };

  // Tracks real user/admin edits only (never set during hydration or by public visitors)
  const hasDirtyChangesRef = useRef(false);
  const mutationVersionRef = useRef(0);
  const autoSaveTimerRef = useRef<number | null>(null);

  const applyHydratedContent = useCallback((content: any, updatedAt?: string | null) => {
    if (!content) return;
    const nextProfile = content.profile ? { ...initialProfile, ...content.profile } : latestStateRef.current.profile;
    const nextProjects = Array.isArray(content.projects) ? content.projects : latestStateRef.current.projects;
    const nextServices = Array.isArray(content.services) ? content.services : latestStateRef.current.services;
    const nextTutorials = Array.isArray(content.tutorials) ? content.tutorials : latestStateRef.current.tutorials;
    const nextArticles = Array.isArray(content.articles) ? content.articles : latestStateRef.current.articles;
    const nextDesigns = Array.isArray(content.designs) ? content.designs : latestStateRef.current.designs;
    const nextAdminUsers =
      Array.isArray(content.adminUsers) && content.adminUsers.length > 0
        ? content.adminUsers
        : latestStateRef.current.adminUsers;

    latestStateRef.current = {
      profile: nextProfile,
      projects: nextProjects,
      services: nextServices,
      tutorials: nextTutorials,
      articles: nextArticles,
      designs: nextDesigns,
      adminUsers: nextAdminUsers
    };

    setProfile(nextProfile);
    setProjects(nextProjects);
    setServices(nextServices);
    setTutorials(nextTutorials);
    setArticles(nextArticles);
    setDesigns(nextDesigns);
    setAdminUsers(nextAdminUsers);
    hasDirtyChangesRef.current = false;
    setSyncStatus('synced');
    setSyncErrorMessage(null);
    if (updatedAt) setLastSavedAt(new Date(updatedAt));
  }, []);

  // Initial Content Hydration from Supabase REST API
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;

        if (payload?.status === 'unconfigured') {
          setSyncStatus('unconfigured');
          setSyncErrorMessage(payload.message || 'Supabase belum dikonfigurasi di Vercel.');
        } else if (payload?.status === 'table_missing') {
          setSyncStatus('error');
          setSyncErrorMessage(payload.message || 'Tabel site_content belum dibuat di Supabase.');
        } else if (payload?.status === 'error') {
          setSyncStatus('error');
          setSyncErrorMessage(payload.error || payload.message || 'Gagal memuat data dari Supabase.');
        }

        const content = payload?.content;
        if (content) {
          applyHydratedContent(content, payload.updatedAt);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setSyncStatus('offline');
        setSyncErrorMessage(err?.message || 'Gagal menghubungi server API.');
      })
      .finally(() => {
        if (!cancelled) {
          setRemoteReady(true);
          setIsInitialized(true);
        }
      });

    return () => { cancelled = true; };
  }, [applyHydratedContent]);

  // Explicit Save Function directly calling PUT /api/content with latest synchronous state
  const saveToDatabase = useCallback(async (overrideData?: any): Promise<{ success: boolean; error?: string }> => {
    if (autoSaveTimerRef.current !== null) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setSyncStatus('saving');
    setSyncErrorMessage(null);
    const snapshotVersion = mutationVersionRef.current;

    try {
      const payload = overrideData || latestStateRef.current;
      const serialized = JSON.stringify(payload);
      const byteSize = new Blob([serialized]).size;

      if (byteSize > 4_300_000) {
        const mb = (byteSize / (1024 * 1024)).toFixed(2);
        const msg = `Ukuran data (${mb} MB) melebihi batas maksimal 4.3 MB Vercel API. Perkecil gambar upload atau gunakan URL gambar eksternal.`;
        setSyncStatus('error');
        setSyncErrorMessage(msg);
        return { success: false, error: msg };
      }

      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: serialized
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }

      if (!res.ok || data.success === false) {
        const fallbackDetail = rawText && rawText.length < 180 ? rawText : res.statusText;
        const msg =
          res.status === 413
            ? 'Ukuran konten melebihi batas 4.5 MB server Vercel. Gunakan gambar yang lebih kecil atau URL gambar.'
            : data.error || `HTTP ${res.status}: ${fallbackDetail || 'Gagal menyimpan ke Supabase'}`;
        setSyncStatus('error');
        setSyncErrorMessage(msg);
        return { success: false, error: msg };
      }

      if (mutationVersionRef.current === snapshotVersion) {
        hasDirtyChangesRef.current = false;
      }
      setSyncStatus('synced');
      setLastSavedAt(new Date());
      setSyncErrorMessage(null);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Koneksi jaringan terputus saat menyimpan.';
      setSyncStatus('offline');
      setSyncErrorMessage(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Re-fetch Latest Data from Supabase
  const refreshFromDatabase = useCallback(async (): Promise<boolean> => {
    try {
      setSyncStatus('saving');
      const response = await fetch(`/api/content?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const payload = await response.json();
      if (payload?.content) {
        applyHydratedContent(payload.content, payload.updatedAt);
        return true;
      }
      if (payload?.status === 'unconfigured') {
        setSyncStatus('unconfigured');
        setSyncErrorMessage(payload.message || 'Supabase belum dikonfigurasi.');
      } else if (payload?.status === 'table_missing' || payload?.status === 'error') {
        setSyncStatus('error');
        setSyncErrorMessage(payload.error || payload.message || 'Gagal memuat data.');
      }
      return false;
    } catch {
      setSyncStatus('error');
      return false;
    }
  }, [applyHydratedContent]);

  // Debounced auto-save: ONLY runs when an authenticated admin has actually made local edits
  useEffect(() => {
    if (!remoteReady || !isInitialized || !isAdminLoggedIn || !hasDirtyChangesRef.current) return;
    autoSaveTimerRef.current = window.setTimeout(() => {
      void saveToDatabase();
    }, 800);
    return () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [remoteReady, isInitialized, isAdminLoggedIn, saveToDatabase, profile, projects, services, tutorials, articles, designs, adminUsers]);

  // Local cache is retained only as an offline fallback; the API is the source of truth.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
    } catch (e) {
      console.warn('Gagal menyimpan admin users ke localStorage', e);
    }
  }, [adminUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Gagal menyimpan proyek ke localStorage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.warn('Gagal menyimpan jasa ke localStorage', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TUTORIALS, JSON.stringify(tutorials));
    } catch (e) {
      console.warn('Gagal menyimpan tutorial ke localStorage', e);
    }
  }, [tutorials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.warn('Gagal menyimpan artikel ke localStorage', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(designs));
    } catch (e) {
      console.warn('Gagal menyimpan desain ke localStorage', e);
    }
  }, [designs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Gagal menyimpan profil ke localStorage', e);
    }
  }, [profile]);

  // Authentication is handled on the server; no credentials are stored in the browser.
  const login = async (user: string, pass: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: user, password: pass })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.error || 'Username/email atau password tidak sesuai.' };
      }
      const authenticatedAdmin = { ...data.admin, password: '' } as AdminUser;
      setAdminUsers((prev) => [authenticatedAdmin, ...prev.filter((item) => item.id !== authenticatedAdmin.id)]);
      setCurrentAdmin(authenticatedAdmin);
      setIsAdminLoggedIn(true);
      try { sessionStorage.setItem(STORAGE_KEYS.AUTH, authenticatedAdmin.username); } catch {}
      return { success: true };
    } catch {
      return { success: false, message: 'Layanan login sedang tidak tersedia.' };
    }
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setCurrentAdmin(null);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {}
  };

  // Admin User CRUD methods
  const addAdminUser = (item: Omit<AdminUser, 'id' | 'createdAt'>): { success: boolean; message?: string; user?: AdminUser } => {
    const trimmedUsername = item.username.trim().toLowerCase();
    const trimmedName = item.name.trim();
    const trimmedPass = item.password.trim();

    if (!trimmedName) {
      return { success: false, message: 'Nama lengkap admin wajib diisi.' };
    }
    if (!trimmedUsername) {
      return { success: false, message: 'Username login wajib diisi.' };
    }
    if (trimmedUsername.length < 3) {
      return { success: false, message: 'Username minimal 3 karakter.' };
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUsername)) {
      return { success: false, message: 'Username hanya boleh huruf, angka, garis bawah (_), atau titik (.).' };
    }
    if (trimmedPass.length < 4) {
      return { success: false, message: 'Kata sandi minimal 4 karakter.' };
    }
    if (adminUsers.some((u) => u.username.toLowerCase() === trimmedUsername)) {
      return { success: false, message: `Username "${trimmedUsername}" sudah digunakan oleh admin lain.` };
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      username: trimmedUsername,
      password: trimmedPass,
      name: trimmedName,
      role: item.role || 'Admin',
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    const markDirty = () => {
      hasDirtyChangesRef.current = true;
      mutationVersionRef.current += 1;
    };

    const nextAdmins = [...latestStateRef.current.adminUsers, newAdmin];
    latestStateRef.current = { ...latestStateRef.current, adminUsers: nextAdmins };
    markDirty();
    setAdminUsers(nextAdmins);
    return { success: true, user: newAdmin };
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>): { success: boolean; message?: string } => {
    const existing = latestStateRef.current.adminUsers.find((u) => u.id === id);
    if (!existing) {
      return { success: false, message: 'Akun admin tidak ditemukan.' };
    }

    const nextUpdates: Partial<AdminUser> = { ...updates };

    if (nextUpdates.username !== undefined) {
      const newUsername = nextUpdates.username.trim().toLowerCase();
      if (!newUsername) {
        return { success: false, message: 'Username tidak boleh kosong.' };
      }
      if (newUsername.length < 3) {
        return { success: false, message: 'Username minimal 3 karakter.' };
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
        return { success: false, message: 'Username hanya boleh huruf, angka, garis bawah (_), atau titik (.).' };
      }
      if (latestStateRef.current.adminUsers.some((u) => u.id !== id && u.username.toLowerCase() === newUsername)) {
        return { success: false, message: `Username "${newUsername}" sudah digunakan oleh admin lain.` };
      }
      nextUpdates.username = newUsername;
    }

    if (nextUpdates.name !== undefined) {
      const newName = nextUpdates.name.trim();
      if (!newName) {
        return { success: false, message: 'Nama lengkap tidak boleh kosong.' };
      }
      nextUpdates.name = newName;
    }

    if (nextUpdates.password !== undefined) {
      const newPass = nextUpdates.password.trim();
      if (newPass === '') {
        delete nextUpdates.password; // Do not update password if left empty
      } else if (newPass.length < 4) {
        return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
      } else {
        nextUpdates.password = newPass;
      }
    }

    const nextAdmins = latestStateRef.current.adminUsers.map((u) =>
      u.id === id ? { ...u, ...nextUpdates } : u
    );
    latestStateRef.current = { ...latestStateRef.current, adminUsers: nextAdmins };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setAdminUsers(nextAdmins);

    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdmin((prev) => (prev ? { ...prev, ...nextUpdates } : null));
      if (nextUpdates.username) {
        try {
          sessionStorage.setItem(STORAGE_KEYS.AUTH, nextUpdates.username);
        } catch {}
      }
    }

    return { success: true };
  };

  const deleteAdminUser = (id: string): { success: boolean; message?: string } => {
    if (latestStateRef.current.adminUsers.length <= 1) {
      return {
        success: false,
        message: 'Tidak dapat menghapus admin terakhir. Minimal harus ada 1 akun administrator di sistem.'
      };
    }

    if (currentAdmin && currentAdmin.id === id) {
      return {
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.'
      };
    }

    const nextAdmins = latestStateRef.current.adminUsers.filter((u) => u.id !== id);
    latestStateRef.current = { ...latestStateRef.current, adminUsers: nextAdmins };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setAdminUsers(nextAdmins);
    return { success: true };
  };

  // Project CRUD
  const addProject = (item: Omit<Project, 'id'>): Project => {
    const newId = `proj-${Date.now()}`;
    const newProject: Project = { ...item, id: newId };
    const next = [newProject, ...latestStateRef.current.projects];
    latestStateRef.current = { ...latestStateRef.current, projects: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProjects(next);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const next = latestStateRef.current.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    latestStateRef.current = { ...latestStateRef.current, projects: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProjects(next);
  };

  const deleteProject = (id: string) => {
    const next = latestStateRef.current.projects.filter((p) => p.id !== id);
    latestStateRef.current = { ...latestStateRef.current, projects: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProjects(next);
  };

  // Service CRUD
  const addService = (item: Omit<ServiceItem, 'id'>): ServiceItem => {
    const newId = `srv-${Date.now()}`;
    const newService: ServiceItem = { ...item, id: newId };
    const next = [newService, ...latestStateRef.current.services];
    latestStateRef.current = { ...latestStateRef.current, services: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setServices(next);
    return newService;
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    const next = latestStateRef.current.services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    latestStateRef.current = { ...latestStateRef.current, services: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setServices(next);
  };

  const deleteService = (id: string) => {
    const next = latestStateRef.current.services.filter((s) => s.id !== id);
    latestStateRef.current = { ...latestStateRef.current, services: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setServices(next);
  };

  // Tutorial CRUD
  const addTutorial = (item: Omit<Tutorial, 'id'>): Tutorial => {
    const newId = `tut-${Date.now()}`;
    const newTutorial: Tutorial = { ...item, id: newId };
    const next = [newTutorial, ...latestStateRef.current.tutorials];
    latestStateRef.current = { ...latestStateRef.current, tutorials: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setTutorials(next);
    return newTutorial;
  };

  const updateTutorial = (id: string, updates: Partial<Tutorial>) => {
    const next = latestStateRef.current.tutorials.map((t) => (t.id === id ? { ...t, ...updates } : t));
    latestStateRef.current = { ...latestStateRef.current, tutorials: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setTutorials(next);
  };

  const deleteTutorial = (id: string) => {
    const next = latestStateRef.current.tutorials.filter((t) => t.id !== id);
    latestStateRef.current = { ...latestStateRef.current, tutorials: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setTutorials(next);
  };

  // Article CRUD
  const addArticle = (item: Omit<Article, 'id'>): Article => {
    const newId = `art-${Date.now()}`;
    const newArticle: Article = { ...item, id: newId };
    const next = [newArticle, ...latestStateRef.current.articles];
    latestStateRef.current = { ...latestStateRef.current, articles: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setArticles(next);
    return newArticle;
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    const next = latestStateRef.current.articles.map((a) => (a.id === id ? { ...a, ...updates } : a));
    latestStateRef.current = { ...latestStateRef.current, articles: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setArticles(next);
  };

  const deleteArticle = (id: string) => {
    const next = latestStateRef.current.articles.filter((a) => a.id !== id);
    latestStateRef.current = { ...latestStateRef.current, articles: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setArticles(next);
  };

  // Design CRUD
  const addDesign = (item: Omit<DesignItem, 'id'>): DesignItem => {
    const newId = `des-${Date.now()}`;
    const newDesign: DesignItem = { ...item, id: newId };
    const next = [newDesign, ...latestStateRef.current.designs];
    latestStateRef.current = { ...latestStateRef.current, designs: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setDesigns(next);
    return newDesign;
  };

  const updateDesign = (id: string, updates: Partial<DesignItem>) => {
    const next = latestStateRef.current.designs.map((d) => (d.id === id ? { ...d, ...updates } : d));
    latestStateRef.current = { ...latestStateRef.current, designs: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setDesigns(next);
  };

  const deleteDesign = (id: string) => {
    const next = latestStateRef.current.designs.filter((d) => d.id !== id);
    latestStateRef.current = { ...latestStateRef.current, designs: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setDesigns(next);
  };

  // Profile Updates
  const updateProfile = (updates: Partial<UserProfile>) => {
    const next = { ...latestStateRef.current.profile, ...updates };
    latestStateRef.current = { ...latestStateRef.current, profile: next };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(next);
  };

  const addSkillGroup = (group: SkillGroup) => {
    const nextProfile = {
      ...latestStateRef.current.profile,
      skillGroups: [...latestStateRef.current.profile.skillGroups, group]
    };
    latestStateRef.current = { ...latestStateRef.current, profile: nextProfile };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(nextProfile);
  };

  const updateSkillGroup = (index: number, group: SkillGroup) => {
    const nextGroups = [...latestStateRef.current.profile.skillGroups];
    nextGroups[index] = group;
    const nextProfile = { ...latestStateRef.current.profile, skillGroups: nextGroups };
    latestStateRef.current = { ...latestStateRef.current, profile: nextProfile };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(nextProfile);
  };

  const deleteSkillGroup = (index: number) => {
    const nextProfile = {
      ...latestStateRef.current.profile,
      skillGroups: latestStateRef.current.profile.skillGroups.filter((_, i) => i !== index)
    };
    latestStateRef.current = { ...latestStateRef.current, profile: nextProfile };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(nextProfile);
  };

  const addTool = (tool: ToolItem) => {
    const nextProfile = {
      ...latestStateRef.current.profile,
      tools: [...latestStateRef.current.profile.tools, tool]
    };
    latestStateRef.current = { ...latestStateRef.current, profile: nextProfile };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(nextProfile);
  };

  const updateTool = (index: number, tool: ToolItem) => {
    const nextTools = [...latestStateRef.current.profile.tools];
    nextTools[index] = tool;
    const nextProfile = { ...latestStateRef.current.profile, tools: nextTools };
    latestStateRef.current = { ...latestStateRef.current, profile: nextProfile };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(nextProfile);
  };

  const deleteTool = (index: number) => {
    const nextProfile = {
      ...latestStateRef.current.profile,
      tools: latestStateRef.current.profile.tools.filter((_, i) => i !== index)
    };
    latestStateRef.current = { ...latestStateRef.current, profile: nextProfile };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProfile(nextProfile);
  };

  // Reset to defaults
  const resetAllData = () => {
    latestStateRef.current = {
      projects: initialProjects,
      services: initialServices,
      tutorials: initialTutorials,
      articles: initialArticles,
      designs: initialDesigns,
      profile: initialProfile,
      adminUsers: initialAdminUsers
    };
    hasDirtyChangesRef.current = true;
    mutationVersionRef.current += 1;
    setProjects(initialProjects);
    setServices(initialServices);
    setTutorials(initialTutorials);
    setArticles(initialArticles);
    setDesigns(initialDesigns);
    setProfile(initialProfile);
    setAdminUsers(initialAdminUsers);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.SERVICES);
      localStorage.removeItem(STORAGE_KEYS.TUTORIALS);
      localStorage.removeItem(STORAGE_KEYS.ARTICLES);
      localStorage.removeItem(STORAGE_KEYS.DESIGNS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USERS);
    } catch {}
  };

  // Export & Import
  const exportDataJSON = () => {
    const fullBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      ...latestStateRef.current
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Format berkas JSON tidak valid.' };
      }
      const nextState = {
        profile: parsed.profile ? { ...initialProfile, ...parsed.profile } : latestStateRef.current.profile,
        projects: Array.isArray(parsed.projects) ? parsed.projects : latestStateRef.current.projects,
        services: Array.isArray(parsed.services) ? parsed.services : latestStateRef.current.services,
        tutorials: Array.isArray(parsed.tutorials) ? parsed.tutorials : latestStateRef.current.tutorials,
        articles: Array.isArray(parsed.articles) ? parsed.articles : latestStateRef.current.articles,
        designs: Array.isArray(parsed.designs) ? parsed.designs : latestStateRef.current.designs,
        adminUsers:
          Array.isArray(parsed.adminUsers) && parsed.adminUsers.length > 0
            ? parsed.adminUsers
            : latestStateRef.current.adminUsers
      };
      latestStateRef.current = nextState;
      hasDirtyChangesRef.current = true;
      mutationVersionRef.current += 1;

      if (parsed.profile) setProfile(nextState.profile);
      if (Array.isArray(parsed.projects)) setProjects(nextState.projects);
      if (Array.isArray(parsed.services)) setServices(nextState.services);
      if (Array.isArray(parsed.tutorials)) setTutorials(nextState.tutorials);
      if (Array.isArray(parsed.articles)) setArticles(nextState.articles);
      if (Array.isArray(parsed.designs)) setDesigns(nextState.designs);
      if (Array.isArray(parsed.adminUsers) && parsed.adminUsers.length > 0) {
        setAdminUsers(nextState.adminUsers);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memproses berkas JSON.' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        services,
        tutorials,
        articles,
        designs,
        profile,
        isAdminLoggedIn,
        adminUsers,
        currentAdmin,
        login,
        logout,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        addProject,
        updateProject,
        deleteProject,
        addService,
        updateService,
        deleteService,
        addTutorial,
        updateTutorial,
        deleteTutorial,
        addArticle,
        updateArticle,
        deleteArticle,
        addDesign,
        updateDesign,
        deleteDesign,
        updateProfile,
        addSkillGroup,
        updateSkillGroup,
        deleteSkillGroup,
        addTool,
        updateTool,
        deleteTool,
        resetAllData,
        exportDataJSON,
        importDataJSON,
        syncStatus,
        lastSavedAt,
        syncErrorMessage,
        saveToDatabase,
        refreshFromDatabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useAppData harus digunakan di dalam DataProvider');
  }
  return context;
};
