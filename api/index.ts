type ApiRequest = {
  method?: string
  url?: string
  body?: any
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (value: unknown) => void
}

const contentKey = 'site_content_v2'
const adminKey = 'site_admins_v1'
const defaultSuperAdmin = {
  id: 'super-admin-risa7lavan',
  username: 'risa7lavan',
  email: 'risa7lavan@gmail.com',
  password: 'Almahyra7$',
  name: 'Super Admin',
  role: 'Super Admin',
  createdAt: '2026-01-01T00:00:00.000Z',
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase environment is not configured')

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`)
  return response.status === 204 ? null : response.json()
}

async function saveAdmins() {
  return supabaseRequest('site_content', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      key: adminKey,
      value: [defaultSuperAdmin],
      updated_at: new Date().toISOString(),
    }),
  })
}

function sendError(res: ApiResponse, code: number, message: string) {
  res.status(code).json({ error: message })
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const path = new URL(req.url || '/', 'https://production.invalid').pathname

  if (path === '/api/auth/login' && req.method === 'POST') {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const validIdentifier = identifier === defaultSuperAdmin.username || identifier === defaultSuperAdmin.email

    if (!validIdentifier || password !== defaultSuperAdmin.password) {
      return sendError(res, 401, 'Kredensial login tidak valid.')
    }

    try {
      await saveAdmins()
      const { password: _password, ...safeAccount } = defaultSuperAdmin
      return res.status(200).json({ success: true, admin: safeAccount })
    } catch (error) {
      console.error('[v0] Production Supabase login synchronization failed:', error)
      return sendError(res, 503, 'Database login belum terhubung ke Supabase.')
    }
  }

  if (path === '/api/content' && req.method === 'GET') {
    try {
      const rows = await supabaseRequest(`site_content?key=eq.${encodeURIComponent(contentKey)}&select=value`)
      return res.status(200).json({ content: rows?.[0]?.value || null })
    } catch (error) {
      console.error('[v0] Production content read failed:', error)
      return sendError(res, 503, 'Konten belum dapat dimuat dari Supabase.')
    }
  }

  if (path === '/api/content' && req.method === 'PUT') {
    try {
      await supabaseRequest('site_content', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ key: contentKey, value: req.body, updated_at: new Date().toISOString() }),
      })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('[v0] Production content write failed:', error)
      return sendError(res, 503, 'Konten belum dapat disimpan ke Supabase.')
    }
  }

  return sendError(res, 404, 'API route tidak ditemukan.')
}
