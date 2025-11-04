export function base64url(buf: ArrayBuffer | Uint8Array | string) {
  const bin =
    typeof buf === 'string'
      ? btoa(buf)
      : btoa(String.fromCharCode(...(buf instanceof Uint8Array ? buf : new Uint8Array(buf))))
  return bin.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function randomBytesBase64Url(n = 32) {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return base64url(a)
}

async function sha256(input: string) {
  const enc = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  return new Uint8Array(digest)
}

export async function makePkcePair() {
  const verifier = randomBytesBase64Url(64)
  const challenge = base64url(await sha256(verifier))
  return { verifier, challenge, method: 'S256' as const }
}

export function fromBase64UrlToJSON<T = unknown>(s: string): T {
  return JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')))
}
