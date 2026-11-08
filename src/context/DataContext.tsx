import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Project, Tutorial, DesignItem, Article, ServiceItem, UserProfile, SkillGroup, ToolItem, AdminUser } from '../types';
import { projectsData as initialProjects } from '../data/projects';
import { tutorialsData as initialTutorials } from '../data/tutorials';
import { designsData as initialDesigns } from '../data/designs';
import { articlesData as initialArticles } from '../data/articles';
import { servicesData as initialServices } from '../data/services';
import { profileData as initialProfile } from '../data/profile';

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'risa7lavan',
    password: 'Almahyra7$',
    name: 'Risa Kurniawan',
    role: 'Super Admin',
    createdAt: '2025-01-01'
  },
  {
    id: 'admin-2',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Sistem',
    role: 'Admin',
    createdAt: '2025-01-01'
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
  login: (user: string, pass: string) => { success: boolean; message?: string };
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

const normalizeImageUrl = (value: string) => {
  const normalized = value.replaceAll('\\\\', '/');
  const imageIndex = normalized.indexOf('/images/');

  if (imageIndex >= 0) {
    const imagePath = normalized.slice(imageIndex + '/images/'.length).split(/[?#]/)[0];
    if (imagePath) return `/images/${imagePath}`;
  }

  const sourceAssetIndex = normalized.indexOf('src/assets/images/');
  return sourceAssetIndex >= 0
    ? `/images/${normalized.slice(sourceAssetIndex + 'src/assets/images/'.length).split(/[?#]/)[0]}`
    : normalized;
};

const normalizeImageUrls = <T,>(value: T): T => {
  if (typeof value === 'string') {
    return normalizeImageUrl(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeImageUrls(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeImageUrls(item)])
    ) as T;
  }

  return value;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Projects State
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  // Tutorials State
  const [tutorials, setTutorials] = useState<Tutorial[]>(initialTutorials);

  // Articles State
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  // Designs State
  const [designs, setDesigns] = useState<DesignItem[]>(initialDesigns);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasRisa = parsed.some((u: AdminUser) => u.username.toLowerCase() === 'risa7lavan');
          if (!hasRisa) {
            const updated = [
              initialAdminUsers[0],
              initialAdminUsers[1],
              ...parsed.filter((u: AdminUser) => u.username !== 'admin' && u.username !== 'owner')
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
    try {
      return Boolean(sessionStorage.getItem(STORAGE_KEYS.AUTH));
    } catch {
      return false;
    }
  });

  const remoteReady = useRef(false);
  const remoteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadRemoteContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('remote content unavailable');
        const payload = await response.json();
        if (cancelled) return;
        const content = payload.content || {};
        if (Array.isArray(content.projects)) setProjects(normalizeImageUrls(content.projects));
        if (Array.isArray(content.services)) setServices(normalizeImageUrls(content.services));
        if (Array.isArray(content.tutorials)) setTutorials(normalizeImageUrls(content.tutorials));
        if (Array.isArray(content.articles)) setArticles(normalizeImageUrls(content.articles));
        if (Array.isArray(content.designs)) setDesigns(normalizeImageUrls(content.designs));
        if (content.profile && typeof content.profile === 'object') {
    setProfile({
      ...normalizeImageUrls(content.profile),
      brandTitle:
        content.profile.brandTitle === 'R. KURNIAWAN (Ruang Digital)'
          ? initialProfile.brandTitle
          : content.profile.brandTitle
    });
  }
      } catch (error) {
        console.warn('[content] Menggunakan data lokal sementara:', error);
      } finally {
        if (!cancelled) remoteReady.current = true;
      }
    };
    void loadRemoteContent();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!remoteReady.current) return;

    const content = { projects, services, tutorials, articles, designs, profile };
    const saveRemoteContent = () => {
      void fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        keepalive: true
      }).then((response) => {
        if (!response.ok) throw new Error(`content save failed (${response.status})`);
      }).catch((error) => console.warn('[content] Gagal menyimpan perubahan:', error));
    };

    if (remoteSaveTimer.current) clearTimeout(remoteSaveTimer.current);
    remoteSaveTimer.current = setTimeout(saveRemoteContent, 350);
    window.addEventListener('pagehide', saveRemoteContent);

    return () => {
      if (remoteSaveTimer.current) clearTimeout(remoteSaveTimer.current);
      window.removeEventListener('pagehide', saveRemoteContent);
    };
  }, [projects, services, tutorials, articles, designs, profile]);

  // Sync to LocalStorage
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

  // Auth methods
  const login = (user: string, pass: string) => {
    const trimmedUser = user.trim().toLowerCase();
    const trimmedPass = pass.trim();

    const matchedAdmin = adminUsers.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
    );

    if (matchedAdmin) {
      const nowFormatted = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const updatedAdmin = { ...matchedAdmin, lastLogin: nowFormatted };

      setAdminUsers((prev) =>
        prev.map((u) => (u.id === matchedAdmin.id ? updatedAdmin : u))
      );
      setCurrentAdmin(updatedAdmin);
      setIsAdminLoggedIn(true);

      try {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, updatedAdmin.username);
      } catch {}

      return { success: true };
    }

    return {
      success: false,
      message: 'Username atau password tidak sesuai. Silakan periksa kembali kredensial Anda.'
    };
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

    setAdminUsers((prev) => [...prev, newAdmin]);
    return { success: true, user: newAdmin };
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>): { success: boolean; message?: string } => {
    const existing = adminUsers.find((u) => u.id === id);
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
      if (adminUsers.some((u) => u.id !== id && u.username.toLowerCase() === newUsername)) {
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

    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...nextUpdates } : u))
    );

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
    if (adminUsers.length <= 1) {
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

    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    return { success: true };
  };

  // Project CRUD
  const addProject = (item: Omit<Project, 'id'>): Project => {
    const newId = `proj-${Date.now()}`;
    const newProject: Project = { ...item, id: newId };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Service CRUD
  const addService = (item: Omit<ServiceItem, 'id'>): ServiceItem => {
    const newId = `srv-${Date.now()}`;
    const newService: ServiceItem = { ...item, id: newId };
    setServices((prev) => [newService, ...prev]);
    return newService;
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Tutorial CRUD
  const addTutorial = (item: Omit<Tutorial, 'id'>): Tutorial => {
    const newId = `tut-${Date.now()}`;
    const newTutorial: Tutorial = { ...item, id: newId };
    setTutorials((prev) => [newTutorial, ...prev]);
    return newTutorial;
  };

  const updateTutorial = (id: string, updates: Partial<Tutorial>) => {
    setTutorials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTutorial = (id: string) => {
    setTutorials((prev) => prev.filter((t) => t.id !== id));
  };

  // Article CRUD
  const addArticle = (item: Omit<Article, 'id'>): Article => {
    const newId = `art-${Date.now()}`;
    const newArticle: Article = { ...item, id: newId };
    setArticles((prev) => [newArticle, ...prev]);
    return newArticle;
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Design CRUD
  const addDesign = (item: Omit<DesignItem, 'id'>): DesignItem => {
    const newId = `des-${Date.now()}`;
    const newDesign: DesignItem = { ...item, id: newId };
    setDesigns((prev) => [newDesign, ...prev]);
    return newDesign;
  };

  const updateDesign = (id: string, updates: Partial<DesignItem>) => {
    setDesigns((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDesign = (id: string) => {
    setDesigns((prev) => prev.filter((d) => d.id !== id));
  };

  // Profile Updates
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addSkillGroup = (group: SkillGroup) => {
    setProfile((prev) => ({
      ...prev,
      skillGroups: [...prev.skillGroups, group]
    }));
  };

  const updateSkillGroup = (index: number, group: SkillGroup) => {
    setProfile((prev) => {
      const next = [...prev.skillGroups];
      next[index] = group;
      return { ...prev, skillGroups: next };
    });
  };

  const deleteSkillGroup = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.filter((_, i) => i !== index)
    }));
  };

  const addTool = (tool: ToolItem) => {
    setProfile((prev) => ({
      ...prev,
      tools: [...prev.tools, tool]
    }));
  };

  const updateTool = (index: number, tool: ToolItem) => {
    setProfile((prev) => {
      const next = [...prev.tools];
      next[index] = tool;
      return { ...prev, tools: next };
    });
  };

  const deleteTool = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }));
  };

  // Reset to defaults
  const resetAllData = () => {
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
      profile,
      projects,
      services,
      tutorials,
      articles,
      designs,
      adminUsers
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Format berkas JSON tidak valid.' };
      }
      if (parsed.profile) setProfile(parsed.profile);
      if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
      if (Array.isArray(parsed.services)) setServices(parsed.services);
      if (Array.isArray(parsed.tutorials)) setTutorials(parsed.tutorials);
      if (Array.isArray(parsed.articles)) setArticles(parsed.articles);
      if (Array.isArray(parsed.designs)) setDesigns(parsed.designs);
      if (Array.isArray(parsed.adminUsers) && parsed.adminUsers.length > 0) {
        setAdminUsers(parsed.adminUsers);
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
        importDataJSON
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
