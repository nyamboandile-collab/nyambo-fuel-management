const AUTH_SUPABASE_URL='https://dyqwsydxyhomudujumxs.supabase.co';
const AUTH_SUPABASE_KEY='sb_publishable_rH-erFTla9rTfqA5eGwwNA_ad0BgDq6';
const authClient=window.supabase.createClient(AUTH_SUPABASE_URL,AUTH_SUPABASE_KEY);

(function(){
  const style=document.createElement('style');
  style.id='red-range-legacy-nav';
  style.textContent=`
    .side{background:#0d1b2a !important;color:#fff !important;width:240px !important;border-right:1px solid #12283c !important;}
    .brand{background:#ef101b !important;color:#fff !important;padding:18px 14px 16px !important;text-align:center !important;}
    .brand-logo{width:205px !important;height:90px !important;max-width:100% !important;margin:auto !important;display:block !important;}
    .brand-name,.brand-sub{color:#fff !important;}
    .nav{padding:18px 14px 30px !important;}
    .nav a{color:#fff !important;background:transparent !important;font-size:16px !important;font-weight:500 !important;padding:14px !important;border-radius:9px !important;margin-bottom:5px !important;}
    .nav a.active{background:#ef101b !important;color:#fff !important;box-shadow:0 3px 8px #0003 !important;}
    .nav .icon{color:inherit !important;width:25px !important;text-align:center !important;}
    .nav .chev{color:#fff !important;margin-left:auto !important;}
    .rr-user-badge{display:block;margin:8px 14px 0;padding:10px 12px;background:#17283a;border-radius:8px;font-size:12px;color:#dbe5ee;}
    @media(max-width:700px){.side{width:240px !important;transform:translateX(-100%);}.side.open{transform:translateX(0);}.brand-logo{width:205px !important;height:90px !important;}.nav a{font-size:16px !important;padding:14px !important;}}
    @media(max-width:430px){.side{width:240px !important;}.brand{padding:18px 14px 16px !important;}.brand-logo{width:205px !important;height:90px !important;}.nav a{font-size:16px !important;padding:14px !important;}}
  `;
  document.head.appendChild(style);

  const path=location.pathname.split('/').pop()||'index.html';
  if(path==='login.html'){
    authClient.auth.getSession().then(({data})=>{if(data.session) location.replace('index.html');});
    return;
  }

  const pageRules={
    owner:['*'],
    manager:['index.html','garage-dashboard.html','pump-readings.html','credit-customers.html','credit-sale.html','payment.html','swipe.html','fuel-purchase.html','fuel-stock.html','expenses.html','reports.html','end-of-day.html'],
    staff:['index.html','garage-dashboard.html','pump-readings.html','credit-customers.html','credit-sale.html','payment.html','swipe.html']
  };
  const roleLabel={owner:'Owner / Admin',manager:'Manager',staff:'Staff'};

  async function setup(){
    const {data:{session}}=await authClient.auth.getSession();
    if(!session){location.replace('login.html');return;}
    let {data:profile}=await authClient.from('user_profiles').select('*').eq('id',session.user.id).maybeSingle();
    if(!profile){
      const name=session.user.user_metadata?.full_name||session.user.user_metadata?.name||session.user.email?.split('@')[0]||'User';
      const r=await authClient.from('user_profiles').insert({id:session.user.id,full_name:name}).select('*').single();
      if(r.error){document.body.innerHTML='<main style="font-family:Arial;padding:30px"><h2>Account setup required</h2><p>Your account is signed in but has not been authorized for this system yet.</p><button onclick="location.href=\'login.html\'">Return to login</button></main>';return;}
      profile=r.data;
    }
    if(!profile.is_active){await authClient.auth.signOut();location.replace('login.html?disabled=1');return;}
    window.RED_RANGE_USER=profile;
    const allowed=pageRules[profile.role]||pageRules.staff;
    if(!allowed.includes('*')&&!allowed.includes(path)){
      if(path==='settings.html') location.replace('index.html'); else location.replace('index.html');
      return;
    }
    document.addEventListener('DOMContentLoaded',()=>{
      const nav=document.querySelector('.nav');
      if(nav){
        nav.querySelectorAll('a[href]').forEach(a=>{
          const href=a.getAttribute('href');
          if(href&&href!=='#'&&!allowed.includes('*')&&!allowed.includes(href)) a.style.display='none';
        });
        if(allowed.includes('*')||allowed.includes('end-of-day.html')){
          if(!nav.querySelector('a[href="end-of-day.html"]')){
            const eod=document.createElement('a');eod.href='end-of-day.html';eod.innerHTML='<span class="icon">✓</span><span>End of Day Closing</span>';nav.appendChild(eod);
          }
        }
        const badge=document.createElement('div');badge.className='rr-user-badge';badge.innerHTML='<b>'+roleLabel[profile.role]+'</b><br>'+((profile.full_name||session.user.email||'User'))+(profile.station_id?'<br>Assigned station':'');nav.appendChild(badge);
        if(!document.getElementById('signOutBtn')){
          const a=document.createElement('a');a.href='#';a.id='signOutBtn';a.innerHTML='<span class="icon">↪</span><span>Sign Out</span>';a.style.marginTop='18px';a.addEventListener('click',async e=>{e.preventDefault();a.style.pointerEvents='none';a.style.opacity='.6';const {error}=await authClient.auth.signOut();if(error){alert('Sign out failed. Please try again.');a.style.pointerEvents='';a.style.opacity='';return;}location.replace('login.html');});nav.appendChild(a);
        }
      }
      window.dispatchEvent(new CustomEvent('red-range-auth-ready',{detail:profile}));
    });
  }
  setup();
})();
