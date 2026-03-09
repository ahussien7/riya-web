export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.pathname = '/r/index.html';
  const asset = await context.env.ASSETS.fetch(new Request(url, context.request));
  return new Response(asset.body, {
    status: 200,
    headers: asset.headers,
  });
}
