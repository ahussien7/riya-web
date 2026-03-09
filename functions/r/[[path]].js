export async function onRequest(context) {
  const response = await context.env.ASSETS.fetch(
    new URL('/r/index.html', context.request.url)
  );
  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
