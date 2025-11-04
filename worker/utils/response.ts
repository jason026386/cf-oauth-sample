export function jsonWithCors(obj: unknown, status = 200): Response {
  return new Response(obj ? (
    typeof obj === 'string' ? obj : JSON.stringify(obj)
  ) : null, {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  })
}
