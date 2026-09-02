const AUTH_SUPABASE_URL='https://dyqwsydxyhomudujumxs.supabase.co';
const AUTH_SUPABASE_KEY='sb_publishable_rH-erFTla9rTfqA5eGwwNA_ad0BgDq6';
const authClient=window.supabase.createClient(AUTH_SUPABASE_URL,AUTH_SUPABASE_KEY);

(function(){
  /* Restore the original Red Range Petroleum navigation appearance everywhere. */
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
    @media(max-width:700px){.side{width:240px !important;transform:translateX(-100%);}.side.open{transform:translateX(0);}.brand-logo{width:205px !important;height:90px !important;}.nav a{font-size:16px !important;padding:14px !important;}}
    @media(max-width:430px){.side{width:240px !important;}.brand{padding:18px 14px 16px !important;}.brand-logo{width:205px !important;height:90px !important;}.nav a{font-size:16px !important;padding:14px !important;}}
  `;
  document.head.appendChild(style);

  const path=location.pathname.split('/').pop()||'index.html';
  if(path==='login.html'){
    authClient.auth.getSession().then(({data})=>{if(data.session) location.replace('index.html');});
    return;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const nav=document.querySelector('.nav');
    if(!nav || document.getElementById('signOutBtn')) return;
    const a=document.createElement('a');
    a.href='#';
    a.id='signOutBtn';
    a.innerHTML='<span class="icon">↪</span><span>Sign Out</span>';
    a.style.marginTop='18px';
    a.addEventListener('click',async e=>{
      e.preventDefault();
      a.style.pointerEvents='none';
      a.style.opacity='.6';
      const {error}=await authClient.auth.signOut();
      if(error){alert('Sign out failed. Please try again.');a.style.pointerEvents='';a.style.opacity='';return;}
      location.replace('login.html');
    });
    nav.appendChild(a);
  });
})();
