// Cloudflare Pages Function
// Endpoint: /api/klasemen
// GET  -> ambil data klasemen tersimpan (publik, siapa saja boleh baca)
// POST -> simpan data klasemen baru (butuh header X-Admin-Pin yang cocok
//         dengan Environment Variable ADMIN_PIN, supaya cuma admin yang
//         sudah login lewat /api/verify-pin yang bisa menyimpan perubahan)
//
// Butuh KV Namespace bernama "KLASEMEN_KV" di-bind ke project Pages ini.
// Caranya: Cloudflare Dashboard -> project ini -> Settings -> Bindings
// -> Add -> KV namespace -> Variable name: KLASEMEN_KV
//
// Butuh juga Environment Variable "ADMIN_PIN" (lihat verify-pin.js).

const KEY = 'klasemen-data';

export async function onRequestGet(context) {
  const { env } = context;
  const stored = await env.KLASEMEN_KV.get(KEY);
  return new Response(
    JSON.stringify({ value: stored ? JSON.parse(stored) : null }),
    { headers: { 'content-type': 'application/json' } }
  );
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const existing = await env.KLASEMEN_KV.get(KEY);
    const pin = request.headers.get('x-admin-pin') || '';
    const pinOk = !!env.ADMIN_PIN && pin === env.ADMIN_PIN;

    // Kalau data belum pernah ada sama sekali, izinkan sekali tanpa PIN
    // supaya website bisa "seed" data awal saat pertama kali dibuka.
    // Begitu data sudah ada, wajib PIN yang benar untuk menimpanya.
    if (existing && !pinOk) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const body = await request.text();
    JSON.parse(body); // validasi JSON valid
    await env.KLASEMEN_KV.put(KEY, body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Data tidak valid' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
