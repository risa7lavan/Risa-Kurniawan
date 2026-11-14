import React, { useEffect } from 'react';
import { useAppData } from '../context/DataContext';

const SITE_URL = 'https://risakurniawan.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/images/hero_creative_workspace_1793775537391.jpg`;

interface SeoManagerProps {
  currentView: string;
  activeProjectSlug?: string | null;
  activeTutorialSlug?: string | null;
  activeArticleSlug?: string | null;
}

function toAbsoluteImageUrl(imgPath?: string): string {
  if (!imgPath) return DEFAULT_IMAGE;
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
  if (imgPath.startsWith('data:')) return DEFAULT_IMAGE;
  return `${SITE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const SeoManager: React.FC<SeoManagerProps> = ({
  currentView,
  activeProjectSlug,
  activeTutorialSlug,
  activeArticleSlug,
}) => {
  const { profile, projects, services, tutorials, articles } = useAppData();

  useEffect(() => {
    const ownerName = profile.name || 'Risa Kurniawan';
    const brandTitle = profile.brandTitle || 'RISA KURNIAWAN';

    let path = '/';
    let title = `${ownerName} — Web Developer, IT Support & Data Entry`;
    let description =
      profile.heroDescription ||
      'Portofolio resmi Risa Kurniawan: jasa pembuatan website modern berbantuan AI, solusi teknis IT Support & jaringan, serta layanan Data Entry profesional di Indonesia.';
    let ogType = 'website';
    let image = toAbsoluteImageUrl(profile.heroImageUrl);
    let robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    const socialUrls =
      profile.socialMedia && profile.socialMedia.length > 0
        ? profile.socialMedia.map((s) => s.url).filter(Boolean)
        : [profile.githubUrl, profile.linkedinUrl, profile.instagramUrl, profile.telegramUrl].filter(Boolean);

    const personEntity = {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: ownerName,
      alternateName: 'R. Kurniawan',
      url: `${SITE_URL}/`,
      image: toAbsoluteImageUrl(profile.avatarUrl || profile.heroImageUrl),
      jobTitle: profile.roleTitle || 'Web Developer · IT Support Specialist · Data Entry Specialist',
      description: profile.aboutShort || description,
      email: profile.email ? `mailto:${profile.email}` : 'mailto:risa7lavan@gmail.com',
      telephone: profile.phone || '+6281297770752',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ID',
        addressLocality: profile.location || 'Indonesia',
      },
      sameAs: socialUrls,
      knowsAbout: [
        'Web Development',
        'AI-Assisted Web Development',
        'React',
        'TypeScript',
        'IT Support',
        'Windows Troubleshooting',
        'Computer Hardware & Networking',
        'Data Entry Specialist',
        'Microsoft Excel & Google Sheets',
      ],
    };

    const graph: Record<string, unknown>[] = [];

    if (currentView === 'admin') {
      path = '/admin';
      title = `Panel Admin — ${brandTitle}`;
      description = 'Dashboard pengelolaan konten website.';
      robots = 'noindex, nofollow';
    } else if (currentView === 'projects') {
      path = '/projects';
      title = `Portofolio Proyek Website — ${ownerName}`;
      description = `Kumpulan proyek pembuatan website modern, e-commerce, dan sistem informasi web yang dibangun oleh ${ownerName}.`;
      graph.push(personEntity, {
        '@type': 'CollectionPage',
        url: `${SITE_URL}/projects`,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      });
    } else if (currentView === 'project-detail' && activeProjectSlug) {
      const project = projects.find((p) => p.slug === activeProjectSlug);
      if (project) {
        path = `/project/${project.slug}`;
        title = `${project.title} — Studi Kasus Web oleh ${ownerName}`;
        description = project.shortDescription || description;
        image = toAbsoluteImageUrl(project.thumbnail);
        ogType = 'article';
        graph.push(
          personEntity,
          {
            '@type': 'CreativeWork',
            name: project.title,
            description: project.shortDescription,
            url: `${SITE_URL}${path}`,
            image,
            author: { '@id': `${SITE_URL}/#person` },
            keywords: project.techStack.join(', '),
            dateCreated: project.year,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Proyek Web', item: `${SITE_URL}/projects` },
              { '@type': 'ListItem', position: 3, name: project.title, item: `${SITE_URL}${path}` },
            ],
          }
        );
      }
    } else if (currentView === 'services') {
      path = '/services';
      title = `Jasa Pembuatan Website, IT Support & Data Entry — ${ownerName}`;
      description = `Layanan profesional ${ownerName}: pembuatan website modern AI, servis & troubleshooting komputer/jaringan IT Support, dan pengolahan Data Entry presisi.`;
      const activeServices = services.filter((s) => s.isActive !== false);
      graph.push(
        personEntity,
        {
          '@type': 'Service',
          serviceType: 'Web Development, IT Support & Data Entry Services',
          provider: { '@id': `${SITE_URL}/#person` },
          areaServed: { '@type': 'Country', name: 'Indonesia' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Katalog Layanan Teknologi',
            itemListElement: activeServices.map((srv) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: srv.title,
                description: srv.shortDescription,
                category: srv.category,
              },
            })),
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Apakah ada garansi untuk servis komputer atau website?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. Setiap perbaikan sistem maupun proyek website mendapatkan garansi dukungan purna jual mulai dari 7 hingga 30 hari tergantung paket layanan yang dipilih.',
              },
            },
            {
              '@type': 'Question',
              name: 'Apakah melayani panggilan ke lokasi kantor / rumah (Onsite)?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tersedia layanan Remote Support (via AnyDesk/TeamViewer) untuk seluruh Indonesia dan layanan kunjungan langsung (Onsite) sesuai jangkauan area operasional.',
              },
            },
          ],
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Jasa & Layanan', item: `${SITE_URL}/services` },
          ],
        }
      );
    } else if (currentView === 'tutorials') {
      path = '/tutorials';
      title = `Panduan & Tutorial IT Support Praktis — ${ownerName}`;
      description = `Dokumentasi langkah demi langkah solusi teknis IT Support: instalasi Windows, troubleshooting Wi-Fi, BSOD, dan perawatan SSD oleh ${ownerName}.`;
      graph.push(personEntity, {
        '@type': 'CollectionPage',
        url: `${SITE_URL}/tutorials`,
        name: title,
        description,
      });
    } else if (currentView === 'tutorial-detail' && activeTutorialSlug) {
      const tutorial = tutorials.find((t) => t.slug === activeTutorialSlug);
      if (tutorial) {
        path = `/tutorial/${tutorial.slug}`;
        title = `${tutorial.title} — Tutorial IT oleh ${ownerName}`;
        description = tutorial.summary || description;
        image = toAbsoluteImageUrl(tutorial.thumbnail);
        ogType = 'article';
        graph.push(
          personEntity,
          {
            '@type': 'HowTo',
            name: tutorial.title,
            description: tutorial.summary,
            image,
            totalTime: `PT${tutorial.readTimeMinutes || 10}M`,
            step: tutorial.steps.map((s) => ({
              '@type': 'HowToStep',
              position: s.stepNumber,
              name: s.title,
              text: s.description,
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Tutorial IT', item: `${SITE_URL}/tutorials` },
              { '@type': 'ListItem', position: 3, name: tutorial.title, item: `${SITE_URL}${path}` },
            ],
          }
        );
      }
    } else if (currentView === 'articles') {
      path = '/articles';
      title = `Artikel & Wawasan Teknologi IT — ${ownerName}`;
      description = `Artikel mendalam seputar perkembangan teknologi AI, panduan keamanan siber, perbandingan hardware, dan tips produktivitas IT oleh ${ownerName}.`;
      graph.push(personEntity, {
        '@type': 'Blog',
        url: `${SITE_URL}/articles`,
        name: title,
        description,
        author: { '@id': `${SITE_URL}/#person` },
      });
    } else if (currentView === 'article-detail' && activeArticleSlug) {
      const article = articles.find((a) => a.slug === activeArticleSlug);
      if (article) {
        path = `/article/${article.slug}`;
        title = `${article.title} — ${ownerName}`;
        description = article.summary || description;
        image = toAbsoluteImageUrl(article.thumbnail);
        ogType = 'article';
        graph.push(
          personEntity,
          {
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.summary,
            image,
            url: `${SITE_URL}${path}`,
            author: { '@id': `${SITE_URL}/#person` },
            publisher: { '@id': `${SITE_URL}/#person` },
            keywords: article.tags.join(', '),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Artikel', item: `${SITE_URL}/articles` },
              { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}${path}` },
            ],
          }
        );
      }
    } else if (currentView === 'designs') {
      path = '/designs';
      title = `Galeri Desain & Identitas Visual — ${ownerName}`;
      description = `Eksplorasi desain visual, poster tipografi Swiss, dan sistem identitas merek oleh ${ownerName}.`;
      graph.push(personEntity, {
        '@type': 'CollectionPage',
        url: `${SITE_URL}/designs`,
        name: title,
        description,
      });
    } else if (currentView === 'about') {
      path = '/about';
      title = `Tentang ${ownerName} — Profil, Keahlian & Perjalanan Karier`;
      description = `Kenali profil lengkap ${ownerName} (${profile.roleTitle}): latar belakang teknis, matriks keahlian web development, IT Support, dan data entry.`;
      graph.push(
        personEntity,
        {
          '@type': 'ProfilePage',
          url: `${SITE_URL}/about`,
          name: title,
          mainEntity: { '@id': `${SITE_URL}/#person` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Tentang', item: `${SITE_URL}/about` },
          ],
        }
      );
    } else if (currentView === 'contact') {
      path = '/contact';
      title = `Hubungi ${ownerName} — Konsultasi Web, IT Support & Data Entry`;
      description = `Konsultasikan kebutuhan pembuatan website, perbaikan komputer/jaringan IT Support, atau jasa entri data dengan ${ownerName} via WhatsApp atau email.`;
      graph.push(
        personEntity,
        {
          '@type': 'ContactPage',
          url: `${SITE_URL}/contact`,
          name: title,
          description,
          mainEntity: { '@id': `${SITE_URL}/#person` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Kontak', item: `${SITE_URL}/contact` },
          ],
        }
      );
    } else {
      path = '/';
      title = `${ownerName} — Web Developer, IT Support & Data Entry`;
      graph.push(
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: `${SITE_URL}/`,
          name: `${brandTitle} — Ruang Kerja Digital`,
          description,
          inLanguage: 'id-ID',
          publisher: { '@id': `${SITE_URL}/#person` },
        },
        personEntity,
        {
          '@type': 'ProfilePage',
          '@id': `${SITE_URL}/#profilepage`,
          url: `${SITE_URL}/`,
          name: `Portofolio Resmi ${ownerName}`,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          mainEntity: { '@id': `${SITE_URL}/#person` },
        }
      );
    }

    const canonicalUrl = `${SITE_URL}${path}`;

    document.title = title;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('name', 'robots', robots);
    upsertCanonicalLink(canonicalUrl);

    // Open Graph
    upsertMetaTag('property', 'og:type', ogType);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:image', image);
    upsertMetaTag('property', 'og:site_name', brandTitle);

    // Twitter Card
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', title);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', image);

    // Dynamic JSON-LD Injection
    if (graph.length > 0) {
      let scriptEl = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-seo-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': graph,
      });
    }
  }, [currentView, activeProjectSlug, activeTutorialSlug, activeArticleSlug, profile, projects, services, tutorials, articles]);

  return null;
};
