const AUTH_SUPABASE_URL='https://dyqwsydxyhomudujumxs.supabase.co';
const AUTH_SUPABASE_KEY='sb_publishable_rH-erFTla9rTfqA5eGwwNA_ad0BgDq6';
const authClient=window.supabase.createClient(AUTH_SUPABASE_URL,AUTH_SUPABASE_KEY);

(function(){
  const path=location.pathname.split('/').pop()||'index.html';
  const isLogin=path==='login.html';
  if(isLogin){
    authClient.auth.getSession().then(({data})=>{if(data.session) location.replace('index.html');});
    return;
  }

  const lock=()=>{document.documentElement.style.visibility='hidden';};
  lock();
  authClient.auth.getSession().then(({data})=>{
    if(!data.session){location.replace('login.html');return;}
    document.documentElement.style.visibility='visible';
  }).catch(()=>location.replace('login.html'));

  window.addEventListener('pageshow',e=>{
    if(e.persisted) authClient.auth.getSession().then(({data})=>{if(!data.session) location.replace('login.html');});
  });

  document.addEventListener('DOMContentLoaded',()=>{
    const nav=document.querySelector('.nav');
    if(!nav || document.getElementById('signOutBtn')) return;
    const a=document.createElement('a');
    a.href='#'; a.id='signOutBtn'; a.innerHTML='<span class="icon">↪</span><span>Sign Out</span>';
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
