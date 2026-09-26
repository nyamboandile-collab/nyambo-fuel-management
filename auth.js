const AUTH_SUPABASE_URL='https://dyqwsydxyhomudujumxs.supabase.co';
const AUTH_SUPABASE_KEY='sb_publishable_rH-erFTla9rTfqA5eGwwNA_ad0BgDq6';
const authClient=window.supabase.createClient(AUTH_SUPABASE_URL,AUTH_SUPABASE_KEY);

(function(){
  const style=document.createElement('style');
  style.id='red-range-legacy-nav';
  style.textContent=`
    .side{background:#0d1b2a !important;color:#fff !important;width:240px !important;border-right:1px solid #12283c !important;display:flex !important;flex-direction:column !important;overflow:hidden !important;}
    .brand{background:#ef101b !important;color:#fff !important;padding:18px 14px 16px !important;text-align:center !important;flex-shrink:0 !important;}
    .brand-logo{width:205px !important;height:90px !important;max-width:100% !important;margin:auto !important;display:block !important;}
    .brand-name,.brand-sub{color:#fff !important;}
    .nav{padding:18px 14px 24px !important;overflow-y:auto !important;overflow-x:hidden !important;flex:1 1 auto !important;min-height:0 !important;max-height:none !important;}
    .nav a{color:#fff !important;background:transparent !important;font-size:16px !important;font-weight:500 !important;padding:14px !important;border-radius:9px !important;margin-bottom:5px !important;}
    .nav a.active{background:#ef101b !important;color:#fff !important;box-shadow:0 3px 8px #0003 !important;}
    .nav .icon{color:inherit !important;width:25px !important;text-align:center !important;}
    .nav .chev{color:#fff !important;margin-left:auto !important;}
    .rr-user-badge{display:block;margin:12px 0 10px;padding:12px;background:#17283a;border-radius:9px;font-size:12px;color:#dbe5ee;}
    .rr-signout{display:flex !important;align-items:center !important;justify-content:center !important;gap:12px !important;width:100% !important;background:#ef101b !important;color:#fff !important;border-radius:9px !important;font-weight:800 !important;margin:4px 0 8px !important;padding:14px !important;min-height:54px !important;box-shadow:0 3px 10px #0006 !important;text-decoration:none !important;position:static !important;z-index:1000 !important;}
    .rr-signout:hover{background:#d90e18 !important;}
    @media(max-width:700px){.side{width:240px !important;transform:translateX(-100%);transition:.2s;box-shadow:4px 0 20px #0005;}.side.open{transform:translateX(0);}.brand-logo{width:205px !important;height:90px !important;}.nav a{font-size:16px !important;padding:14px !important;}}
    @media(max-width:430px){.side{width:300px !important;}.brand{padding:18px 14px 16px !important;}.brand-logo{width:215px !important;height:90px !important;}.nav a{font-size:18px !important;padding:15px 12px !important;}.rr-signout{font-size:18px !important;}}
  `;
  document.head.appendChild(style);

  const path=location.pathname.split('/').pop()||'index.html';
  if(path==='login.html'){
    authClient.auth.getSession().then(({data})=>{if(data.session) location.replace('index.html');});
    return;
  }

  const pageRules={
    owner:['*'],
    admin:['*'],
    manager:['index.html','garage-dashboard.html','pump-readings.html','credit-customers.html','credit-sale.html','payment.html','swipe.html','fuel-purchase.html','fuel-stock.html','expenses.html','reports.html','end-of-day.html'],
    staff:['index.html','garage-dashboard.html','pump-readings.html','credit-customers.html','credit-sale.html','payment.html','swipe.html']
  };
  const roleLabel={owner:'Owner / Admin',admin:'Administrator',manager:'Manager',staff:'Staff'};

  async function setup(){
    const {data:{session}}=await authClient.auth.getSession();
    if(!session){location.replace('login.html');return;}

    const {data:profile,error:profileError}=await authClient
      .from('user_profiles')
      .select('*')
      .eq('id',session.user.id)
      .maybeSingle();

    if(profileError||!profile){
      document.body.innerHTML='<main style="font-family:Arial;padding:30px"><h2>Account not assigned</h2><p>Your account is signed in but has not been assigned to a company yet. Ask the company administrator to invite or activate your account.</p><button onclick="authClient.auth.signOut().then(()=>location.href=\'login.html\')">Return to login</button></main>';
      return;
    }

    if(!profile.organization_id||!profile.is_active){
      await authClient.auth.signOut();
      location.replace('login.html?disabled=1');
      return;
    }

    const {data:membership,error:membershipError}=await authClient
      .from('organization_members')
      .select('organization_id,role,is_active')
      .eq('organization_id',profile.organization_id)
      .eq('user_id',session.user.id)
      .maybeSingle();

    if(membershipError||!membership||!membership.is_active){
      await authClient.auth.signOut();
      location.replace('login.html?disabled=1');
      return;
    }

    const {data:org}=await authClient
      .from('organizations')
      .select('id,name,slug,is_active')
      .eq('id',profile.organization_id)
      .maybeSingle();

    if(!org||!org.is_active){
      await authClient.auth.signOut();
      location.replace('login.html?disabled=1');
      return;
    }

    profile.role=membership.role||profile.role;
    window.RED_RANGE_USER=profile;
    window.RED_RANGE_ORGANIZATION=org;
    window.RED_RANGE_ORGANIZATION_ID=org.id;

    const allowed=pageRules[profile.role]||pageRules.staff;
    if(!allowed.includes('*')&&!allowed.includes(path)){location.replace('index.html');return;}

    const buildNav=()=>{
      const nav=document.querySelector('.nav');
      const side=document.querySelector('.side');
      if(!nav||!side)return;
      nav.querySelectorAll('a[href]').forEach(a=>{
        const href=a.getAttribute('href');
        if(href&&href!=='#'&&!allowed.includes('*')&&!allowed.includes(href)) a.style.display='none';
      });

      const old=document.getElementById('signOutBtn');
      if(old)old.remove();
      const oldBadge=nav.querySelector('.rr-user-badge');
      if(oldBadge)oldBadge.remove();

      const badge=document.createElement('div');
      badge.className='rr-user-badge';
      badge.innerHTML='<b>'+roleLabel[profile.role]+'</b><br>'+((profile.full_name||session.user.email||'User'))+'<br><span style="opacity:.8">'+org.name+'</span>'+(profile.station_id?'<br>Assigned station':'') ;

      const a=document.createElement('a');
      a.href='#';
      a.id='signOutBtn';
      a.className='rr-signout';
      a.innerHTML='<span class="icon">↪</span><span>Sign Out</span>';
      a.addEventListener('click',async e=>{
        e.preventDefault();
        a.style.pointerEvents='none';
        a.style.opacity='.6';
        const {error}=await authClient.auth.signOut();
        if(error){alert('Sign out failed. Please try again.');a.style.pointerEvents='';a.style.opacity='';return;}
        location.replace('login.html');
      });

      nav.appendChild(badge);
      nav.appendChild(a);
    };

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildNav,{once:true});
    else buildNav();
    window.dispatchEvent(new CustomEvent('red-range-auth-ready',{detail:{profile,organization:org}}));
  }
  setup();
})();