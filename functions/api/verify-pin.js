// Cloudflare Pages Function
// Endpoint: /api/verify-pin
// POST { pin: "..." } -> { ok: true/false }
//
// PIN disimpan sebagai Environment Variable (secret) bernama ADMIN_PIN,
// BUKAN ditulis di kode. Cara set:
// Cloudflare Dashboard -> project ini -> Settings -> Environment variables
// -> Add variable -> Name: ADMIN_PIN, Value: (PIN pilihan lo) -> centang "Encrypt" -> Save
// Lalu redeploy (Deployments -> Retry deployment) supaya kepasang.

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const pin = typeof body.pin === 'string' ? body.pin : '';
    const ok = !!env.ADMIN_PIN && pin === env.ADMIN_PIN;
    return new Response(JSON.stringify({ ok }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
