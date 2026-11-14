export function getRoutePath(view: string, slug?: string): string {
  if (view === 'project-detail' && slug) return `/project/${encodeURIComponent(slug)}`;
  if (view === 'tutorial-detail' && slug) return `/tutorial/${encodeURIComponent(slug)}`;
  if (view === 'article-detail' && slug) return `/article/${encodeURIComponent(slug)}`;
  if (!view || view === 'home') return '/';
  if (['projects', 'services', 'tutorials', 'articles', 'designs', 'about', 'contact', 'admin'].includes(view)) {
    return `/${view}`;
  }
  return '/';
}

export interface ParsedRoute {
  view: string;
  projectSlug: string | null;
  tutorialSlug: string | null;
  articleSlug: string | null;
  wasHash: boolean;
}

export function parseCurrentLocation(): ParsedRoute {
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();

  // Prioritize legacy hash URL if present (e.g. /#projects or /#tutorial/slug)
  const target = rawHash || rawPath;
  const wasHash = Boolean(rawHash);

  if (!target || target === 'home') {
    return { view: 'home', projectSlug: null, tutorialSlug: null, articleSlug: null, wasHash };
  }

  if (target.startsWith('project/')) {
    const slug = decodeURIComponent(target.slice('project/'.length));
    return { view: 'project-detail', projectSlug: slug, tutorialSlug: null, articleSlug: null, wasHash };
  }

  if (target.startsWith('tutorial/')) {
    const slug = decodeURIComponent(target.slice('tutorial/'.length));
    return { view: 'tutorial-detail', projectSlug: null, tutorialSlug: slug, articleSlug: null, wasHash };
  }

  if (target.startsWith('article/')) {
    const slug = decodeURIComponent(target.slice('article/'.length));
    return { view: 'article-detail', projectSlug: null, tutorialSlug: null, articleSlug: slug, wasHash };
  }

  if (['projects', 'services', 'tutorials', 'articles', 'designs', 'about', 'contact', 'admin'].includes(target)) {
    return { view: target, projectSlug: null, tutorialSlug: null, articleSlug: null, wasHash };
  }

  return { view: 'home', projectSlug: null, tutorialSlug: null, articleSlug: null, wasHash };
}
