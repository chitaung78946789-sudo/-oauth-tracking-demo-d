// Replace only these two placeholders with Supabase Project URL and anon/publishable key.
const SUPABASE_URL = gpg --list-secret-keys --keyid-format=long
const SUPABASE_ANON_KEY = 3AA5C34371567BD2
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const consent = document.querySelector('#consent');
const login = document.querySelector('#login');
const withdraw = document.querySelector('#withdraw');
const statusEl = document.querySelector('#status');
const profile = document.querySelector('#profile');

consent.addEventListener('change', () => { login.disabled = !consent.checked; });

login.addEventListener('click', async () => {
  if (!consent.checked) return;
  statusEl.textContent = 'Google consent screen သို့ သွားနေပါတယ်…';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href.split('?')[0].split('#')[0] }
  });
  if (error) statusEl.textContent = `Login မအောင်မြင်ပါ: ${error.message}`;
});

async function loadUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || '(name မရပါ)';
  const picture = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  profile.hidden = false;
  profile.innerHTML = `${picture ? `<img src="${safe(picture)}" alt="profile">` : ''}<strong>${safe(name)}</strong><br><span>${safe(user.email || '')}</span>`;
  withdraw.hidden = false;
  statusEl.textContent = 'Login အောင်မြင်ပါပြီ။ Consent ရပြီးနောက် event ကို သိမ်းနေပါတယ်…';
  const { error } = await supabase.functions.invoke('collect-visitor', { body: { consent_version: 'v1' } });
  statusEl.textContent = error ? `Event သိမ်းမရပါ: ${error.message}` : 'Consent ပြီးနောက် demo event ကို သိမ်းပြီးပါပြီ။';
}

withdraw.addEventListener('click', async () => {
  if (!confirm('သင့် demo records အားလုံးကို ဖျက်မလား?')) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('visitor_events').delete().eq('auth_user_id', user.id);
  if (error) { statusEl.textContent = `ဖျက်မရပါ: ${error.message}`; return; }
  await supabase.auth.signOut();
  location.reload();
});

function safe(value) {
  return String(value).replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

loadUser();
