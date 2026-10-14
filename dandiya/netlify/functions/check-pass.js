const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  const { code } = JSON.parse(event.body);

  const selectRes = await fetch(
    `${SUPABASE_URL}/rest/v1/dandiya_passes?code=eq.${encodeURIComponent(code)}&select=code,used`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY } }
  );
  const rows = await selectRes.json();

  if (!rows.length) return { statusCode: 200, body: JSON.stringify({ status: 'invalid' }) };
  if (rows[0].used)  return { statusCode: 200, body: JSON.stringify({ status: 'used' }) };

  await fetch(
    `${SUPABASE_URL}/rest/v1/dandiya_passes?code=eq.${encodeURIComponent(code)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ used: true, scanned_at: new Date().toISOString() })
    }
  );

  return { statusCode: 200, body: JSON.stringify({ status: 'valid' }) };
};
