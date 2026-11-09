# Google OAuth Tracking Demo

ဒီ project ကို ကျွန်တော်က code အားလုံးတည်ဆောက်ပေးထားပါတယ်။ သင့် account ထဲသို့ ကျွန်တော်က login ဝင်ဖန်တီးမပေးနိုင်သောကြောင့် Google Cloud, Supabase, GitHub မှာ ခလုတ်နှိပ်ရမည့်အပိုင်းများသာ သင်လုပ်ရပါမယ်။ Password, OTP, Client Secret, service-role key ကို မပို့ပါနှင့်။

## ပါဝင်သောဖိုင်များ

- `index.html` — consent စာနှင့် Google sign-in page
- `style.css` — ဖုန်းတွင်ကြည့်ကောင်းစေရန် style
- `app.js` — Supabase OAuth, consent, collect, withdraw logic
- `database.sql` — table နှင့် RLS policies
- `supabase/functions/collect-visitor/index.ts` — server-side event collection

## လုပ်ရမည့်အဆင့်တို

1. Supabase project ဖန်တီးပါ။
2. `database.sql` ထဲမှ `admin@example.com` ကို ကိုယ့် Gmail ဖြင့်ပြောင်းပြီး Supabase SQL Editor တွင် Run ပါ။
3. Google Cloud > Google Auth Platform တွင် `openid`, `email`, `profile` scopes သာထားပါ။
4. Supabase Authentication > Providers > Google ကို Enable လုပ်ပြီး Google Client ID/Secret ထည့်ပါ။
5. Supabase Edge Functions တွင် `supabase/functions/collect-visitor/index.ts` ကို `collect-visitor` အမည်ဖြင့် deploy ပါ။
6. `app.js` ထဲက `YOUR_SUPABASE_URL` နှင့် `YOUR_SUPABASE_ANON_KEY` ကို Supabase API values နဲ့ အစားထိုးပါ။
7. ဒီ folder ကို GitHub repository သို့ upload ပြီး GitHub Pages ဖွင့်ပါ။
8. GitHub Pages URL ကို Google Authorized JavaScript origin, Supabase Site URL, Redirect URLs ထဲထည့်ပါ။

## လုံခြုံရေး

Frontend ထဲမှာ Supabase URL နဲ့ anon/publishable key သာပါရပါမယ်။ Google Client Secret နှင့် Supabase service-role key ကို browser/GitHub ထဲ မထည့်ရပါ။ Consent မရခင် `signInWithOAuth` မခေါ်ပါ။ IP/city သည် privacy notice ထဲမှာ ဖော်ပြရမည့် personal data ဖြစ်နိုင်ပါသည်။

## Retention

`database.sql` အဆုံးမှာ 30 ရက်ကျော်သော records ဖျက်ရန် SQL ပါသည်။ လက်တွေ့ data retention မူဝါဒနှင့် ကိုက်ညီအောင် ရက်အရေအတွက်ပြောင်းပြီး ပုံမှန် run ပါ။
