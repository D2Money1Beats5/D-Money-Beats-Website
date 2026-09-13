const SERVICES=new Set(['mixing','mastering','mix-master']);
const LABELS={mp3:'MP3 Lease',wav:'WAV Lease',trackouts:'Trackouts',unlimited:'Unlimited','bundle-mp3-3':'3 MP3 Bundle','bundle-wav-3':'3 WAV Bundle',mixing:'Mixing Service',mastering:'Mastering Service','mix-master':'Mix + Master Service'};

export async function onRequestGet({request,env}){
  try{
    const url=new URL(request.url);
    const sessionId=url.searchParams.get('session_id')||'';
    if(!/^cs_(test_)?[A-Za-z0-9_]+$/.test(sessionId))return text('Invalid order reference.',400);
    if(!env.STRIPE_SECRET_KEY)return text('Payment verification is not configured.',503);
    const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`}});
    const s=await r.json();
    if(!r.ok||s.payment_status!=='paid'||s.status!=='complete')return text('Agreement unavailable until successful payment is verified.',402);
    const product=String(s.metadata?.product||'');
    const beats=parseBeats(s.metadata?.beats);
    const service=SERVICES.has(product);
    const customer=s.customer_details?.name||s.customer_details?.email||s.customer_email||'Purchaser';
    const email=s.customer_details?.email||s.customer_email||'Not provided';
    const amount=((s.amount_total||0)/100).toFixed(2).toString();
    const currency=String(s.currency||'usd').toUpperCase();
    const date=new Date((s.created||Math.floor(Date.now()/1000))*1000).toISOString().slice(0,10);
    const version=s.metadata?.license_version||'2026-09-13';
    const title=service?'D-MONEY BEATS — PAID SERVICE ORDER RECORD':'D-MONEY BEATS — ORDER-SPECIFIC BEAT LICENSE';
    const body=service?serviceText(product):licenseText(product,beats);
    const document=`${title}\n\nOrder reference: ${s.id}\nPurchaser: ${customer}\nEmail: ${email}\nOrder date: ${date}\nProduct: ${LABELS[product]||product}\nBeat(s): ${beats.length?beats.join(', '):'Not applicable'}\nAmount paid: ${currency} ${amount}\nAgreement version: ${version}\n\n${body}\n\nThis order record is valid only with the matching successfully paid Stripe order. The D-Money Beats Terms of Service, Delivery & Refund Policy, Privacy Policy, and general licensing framework in effect for this agreement version are incorporated by reference.\n\nKeep this file with your Stripe receipt for your records.`;
    const filename=service?`D-Money-Beats-${slug(product)}-order.txt`:`D-Money-Beats-${slug(product)}-license.txt`;
    return new Response(document,{status:200,headers:{'content-type':'text/plain; charset=utf-8','content-disposition':`attachment; filename="${filename}"`,'cache-control':'no-store','x-content-type-options':'nosniff'}});
  }catch{return text('Unable to generate the agreement right now.',500)}
}
function parseBeats(raw){try{const v=JSON.parse(raw||'[]');return Array.isArray(v)?v.map(String).slice(0,3):[]}catch{return []}}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function licenseText(product,beats){
  const tier=product==='bundle-mp3-3'?'mp3':product==='bundle-wav-3'?'wav':product;
  const delivery={mp3:'Untagged MP3',wav:'24-bit WAV plus MP3',trackouts:'WAV, MP3, and available stems',unlimited:'WAV, MP3, and available stems'}[tier]||'Files described at checkout';
  return `LICENSE GRANT\nD-Money Beats grants the purchaser a non-exclusive license for one new song per listed beat, subject to the purchased tier and the site licensing terms.\n\nDELIVERY\n${delivery}. Bundle purchases apply the same purchased tier separately to each listed beat.\n\nOWNERSHIP\nOwnership of the underlying beat, producer composition, sound recording, project files, trademarks, and producer publishing interest is not transferred. D-Money Beats may continue licensing the beat to other customers.\n\nPERMITTED USE\nThe purchaser may create and commercially release a new song using the licensed beat and distribute that song through customary streaming, download, video, social, radio, live-performance, and promotional channels within the purchased tier's limits.\n\nRESTRICTIONS\nThe raw beat or stems may not be resold, re-licensed, given away, or distributed as standalone production files.\n\nCREDIT\nWhere platform fields permit, credit the producer as “Prod. by D-Money” or substantially similar wording.`;
}
function serviceText(product){return `PAID SERVICE ORDER\nThis record confirms successful payment for the selected D-Money Beats audio service. After payment, the purchaser must provide the project files, references, notes, and other materials reasonably required to perform the service. Scope changes or additional work outside the purchased service may require a separate quote. Final delivery timing begins after all required project materials are received and accepted.`}
function text(message,status){return new Response(message,{status,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}})}