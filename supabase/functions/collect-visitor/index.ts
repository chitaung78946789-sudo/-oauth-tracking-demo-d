import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

function parseUserAgent(ua: string) {
  const text = ua.toLowerCase();
  return {
    deviceType: /mobile|android|iphone|ipad/.test(text) ? 'Mobile' : 'Desktop',
    operatingSystem: /android/.test(text) ? 'Android' : /iphone|ipad|ios/.test(text) ? 'iOS' : /windows/.test(text) ? 'Windows' : /mac os/.test(text) ? 'macOS' : /linux/.test(text) ? 'Linux' : 'Other',
    browser: /edg\//.test(text) ? 'Edge' : /chrome\//.test(text) ? 'Chrome' : /firefox\//.test(text) ? 'Firefox' : /safari\//.test(text) ? 'Safari' : 'Other',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Login required' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(url, service);
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'Invalid session' }, 401);

  let body: { consent_version?: string } = {};
  try { body = await req.json(); } catch (_) {}
  const ua = req.headers.get('user-agent') || 'unknown';
  const ip = req.headers.get('cf-connecting-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null;
  const country = req.headers.get('cf-ipcountry') || null;
  const device = parseUserAgent(ua);
  let city: string | null = null;
  if (ip) {
    try {
      const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
      if (response.ok) city = (await response.json()).city || null;
    } catch (_) { city = null; }
  }

  const { data, error } = await adminClient.from('visitor_events').insert({
    auth_user_id: user.id,
    google_user_id: user.user_metadata?.sub || user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    email: user.email || null,
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    ip_address: ip,
    country,
    city,
    device_type: device.deviceType,
    operating_system: device.operatingSystem,
    browser: device.browser,
    consent_version: body.consent_version || 'v1',
  }).select('id, visited_at').single();

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, event: data });
});
