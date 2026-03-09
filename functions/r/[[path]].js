const EDGE_FUNCTION_URL =
  'https://dczsnuftakcgezemvrqz.supabase.co/functions/v1/get-payment-request';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // pathParts for /r/ABC123 is ['r', 'ABC123']
  // We want the segment after 'r'.
  const rIndex = pathParts.indexOf('r');
  const code = rIndex !== -1 ? pathParts[rIndex + 1] : undefined;

  if (!code) {
    // No short code present — fall through to the static error page.
    return context.env.ASSETS.fetch(
      new Request(url.origin + '/r/index.html', context.request)
    );
  }

  // Proxy to the Edge Function, requesting an HTML response so the function
  // returns the server-rendered page with dynamic OG tags pre-populated.
  const edgeUrl = `${EDGE_FUNCTION_URL}?code=${encodeURIComponent(code)}`;

  let edgeResponse;
  try {
    edgeResponse = await fetch(edgeUrl, {
      headers: { Accept: 'text/html' },
    });
  } catch (_networkError) {
    // Edge Function unreachable — serve static fallback so the user sees
    // something rather than a blank Cloudflare error page.
    return context.env.ASSETS.fetch(
      new Request(url.origin + '/r/index.html', context.request)
    );
  }

  // Pass the body through unchanged; normalise headers so Cloudflare does
  // not inherit the Edge Function's CORS / auth headers.
  return new Response(edgeResponse.body, {
    status: edgeResponse.status,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': edgeResponse.ok ? 'public, max-age=60' : 'no-store',
    },
  });
}
