const PRODUCTS={
  mp3:{name:'D-Money Beats — MP3 Lease',amount:2999,kind:'license'},
  wav:{name:'D-Money Beats — WAV Lease',amount:4999,kind:'license'},
  trackouts:{name:'D-Money Beats — Trackouts',amount:9999,kind:'license'},
  unlimited:{name:'D-Money Beats — Unlimited License',amount:19999,kind:'license'},
  'bundle-mp3-3':{name:'D-Money Beats — 3 MP3 Bundle',amount:6999,kind:'bundle'},
  'bundle-wav-3':{name:'D-Money Beats — 3 WAV Bundle',amount:11999,kind:'bundle'},
  mixing:{name:'D-Money Beats — Mixing',amount:9999,kind:'service'},
  mastering:{name:'D-Money Beats — Mastering',amount:4999,kind:'service'},
  'mix-master':{name:'D-Money Beats — Mix + Master',amount:12999,kind:'service'}
};
const BEATS=new Set(['What A Time','All Set','Balance','Decepticons','How Its Done','Inna Glitch','Let Me Vent Bxsh','We Had Pipes In A Bag','Young Sizzle']);

export async function onRequestPost({request,env}){
  try{
    const body=await request.json();
    if(!body?.termsAccepted)return json({error:'License terms must be accepted.'},400);
    const product=PRODUCTS[body.product];
    if(!product)return json({error:'Unknown product.'},400);
    if(!env.STRIPE_SECRET_KEY)return json({error:'Stripe checkout is not connected on the live site yet.'},503);

    const beats=Array.isArray(body.beats)?body.beats.map(String):[];
    const unique=[...new Set(beats)];
    if(unique.some(b=>!BEATS.has(b)))return json({error:'One or more selected beats are invalid.'},400);
    if(product.kind==='bundle'&&unique.length!==3)return json({error:'Choose exactly three different beats.'},400);
    if(product.kind==='license'&&unique.length!==1)return json({error:'Choose one beat for this license.'},400);
    if(product.kind==='service'&&unique.length)return json({error:'Beat selection is not required for this service.'},400);

    const url=new URL(request.url);
    const description=unique.length?`${product.name}: ${unique.join(', ')}`:product.name;
    const form=new URLSearchParams();
    form.set('mode','payment');
    form.set('line_items[0][price_data][currency]','usd');
    form.set('line_items[0][price_data][unit_amount]',String(product.amount));
    form.set('line_items[0][price_data][product_data][name]',product.name);
    form.set('line_items[0][price_data][product_data][description]',description.slice(0,500));
    form.set('line_items[0][quantity]','1');
    form.set('success_url',`${url.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
    form.set('cancel_url',`${url.origin}/#licensing`);
    form.set('customer_creation','always');
    form.set('billing_address_collection','auto');
    form.set('payment_intent_data[description]',description.slice(0,500));
    form.set('metadata[product]',String(body.product));
    form.set('metadata[beats]',JSON.stringify(unique).slice(0,450));
    form.set('metadata[license_version]',String(body.licenseVersion||'2026-09-13'));
    form.set('metadata[terms_accepted]','true');

    const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'content-type':'application/x-www-form-urlencoded'},body:form});
    const data=await r.json();
    if(!r.ok)return json({error:data?.error?.message||'Stripe checkout could not be created.'},r.status);
    return json({url:data.url,session_id:data.id});
  }catch(e){return json({error:'Unable to create checkout.'},500)}
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}})}