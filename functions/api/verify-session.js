const SERVICES=new Set(['mixing','mastering','mix-master']);
const PRODUCT_LABELS={mp3:'MP3 Lease',wav:'WAV Lease',trackouts:'Trackouts',unlimited:'Unlimited','bundle-mp3-3':'3 MP3 Bundle','bundle-wav-3':'3 WAV Bundle',mixing:'Mixing',mastering:'Mastering','mix-master':'Mix + Master'};

export async function onRequestGet({request,env}){
  try{
    const url=new URL(request.url);
    const sessionId=url.searchParams.get('session_id')||'';
    if(!/^cs_(test_)?[A-Za-z0-9_]+$/.test(sessionId))return json({verified:false,error:'Invalid order reference.'},400);
    if(!env.STRIPE_SECRET_KEY)return json({verified:false,error:'Payment verification is not configured.'},503);

    const endpoint=`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.latest_charge`;
    const r=await fetch(endpoint,{headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`}});
    const session=await r.json();
    if(!r.ok)return json({verified:false,error:session?.error?.message||'Unable to verify payment.'},r.status);

    const paid=session.payment_status==='paid'&&session.status==='complete';
    if(!paid)return json({verified:false,payment_status:session.payment_status||'unpaid',error:'Payment has not been verified as complete.'},402);

    const product=String(session.metadata?.product||'');
    const beats=parseBeats(session.metadata?.beats);
    const isService=SERVICES.has(product);
    const receiptUrl=session.payment_intent?.latest_charge?.receipt_url||null;
    const receiptNumber=session.payment_intent?.latest_charge?.receipt_number||session.payment_intent?.latest_charge?.id||null;
    const tier=deliveryTier(product);
    const delivery= isService ? [] : resolveDelivery(env.DELIVERY_MANIFEST_JSON,beats,tier);
    const deliveryReady=isService||delivery.length>0&&delivery.every(item=>item.files.length>0);

    return json({
      verified:true,
      payment_status:'paid',
      session_id:session.id,
      product,
      product_label:PRODUCT_LABELS[product]||product,
      beats,
      amount_total:session.amount_total,
      currency:session.currency,
      customer_email:session.customer_details?.email||session.customer_email||null,
      customer_name:session.customer_details?.name||null,
      license_version:session.metadata?.license_version||null,
      receipt_url:receiptUrl,
      receipt_reference:receiptNumber,
      agreement_url:`/api/order-agreement?session_id=${encodeURIComponent(session.id)}`,
      service:isService,
      delivery_ready:deliveryReady,
      delivery,
      service_next_step:isService?'Use the order-support contact form and include this order reference. D-Money Beats will collect the project files and notes required for the booked service.':null,
      delivery_message:deliveryReady?null:'Payment is verified, but the protected master-file delivery manifest has not been connected for this item yet.'
    });
  }catch(e){return json({verified:false,error:'Unable to verify this order right now.'},500)}
}

function parseBeats(raw){try{const v=JSON.parse(raw||'[]');return Array.isArray(v)?v.map(String).slice(0,3):[]}catch{return []}}
function deliveryTier(product){if(product==='bundle-mp3-3')return'mp3';if(product==='bundle-wav-3')return'wav';return product}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function resolveDelivery(raw,beats,tier){
  if(!raw||!beats.length||!tier)return [];
  let manifest;try{manifest=JSON.parse(raw)}catch{return []}
  return beats.map(title=>{
    const key=slug(title);
    const beat=manifest[title]||manifest[key]||{};
    const value=beat[tier];
    const files=(Array.isArray(value)?value:value?[value]:[]).map((entry,i)=>typeof entry==='string'?{label:`${title} — file ${i+1}`,url:entry}:{label:entry.label||`${title} — file ${i+1}`,url:entry.url}).filter(x=>x.url);
    return {beat:title,tier,files};
  });
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}})}