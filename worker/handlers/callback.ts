import { z } from 'zod'
import { jsonWithCors } from '../utils/response'
import { TxnRecord } from '../types/txn'
import { StatePayload } from '../types/state'
import { fromBase64UrlToJSON } from '../utils/pkce'

// Cloudflare Workers의 SubtleCrypto + JOSE 없이 순정 WebCrypto로 ES256 서명 예시
export async function makeAppleClientSecret({
  teamId, keyId, clientId, privateKeyPem, expSec = 3000
}: {
  teamId: string
  keyId: string
  clientId: string
  privateKeyPem: string // -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----
  expSec?: number
}) {
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + expSec,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  }
  const enc = (obj: any) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  const data = `${enc(header)}.${enc(payload)}`

  // PEM → PKCS8 → CryptoKey
  const pkcs8 = atob(privateKeyPem.replace(/-----.*KEY-----/g, '').replace(/\s+/g, ''))
  const keyData = Uint8Array.from(pkcs8, c => c.charCodeAt(0)).buffer
  const key = await crypto.subtle.importKey(
    'pkcs8', keyData, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )

  const sigBuf = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(data))
  // DER → R|S concat(64) 변환이 필요하지만, CF WebCrypto는 DER이 아니라 RAW 시그니처를 반환함.
  // 환경에 따라 DER일 수 있으니, 필요 시 변환 로직 추가.
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  return `${data}.${sig}`
}

export function appleAuthURL({
  clientId,
  redirectUri,
  scope,
  codeChallenge,
  state,
  nonce,              // raw nonce (server가 쿠키에 저장 후 검증에 사용)
  responseMode = 'query', // 'form_post'도 가능
}: {
  clientId: string
  redirectUri: string
  scope: string       // 'name email' 권장
  codeChallenge: string
  state: string
  nonce: string
  responseMode?: 'query' | 'form_post'
}) {
  const auth = new URL('https://appleid.apple.com/auth/authorize')
  auth.searchParams.set('response_type', 'code')
  auth.searchParams.set('response_mode', responseMode)
  auth.searchParams.set('client_id', clientId)
  auth.searchParams.set('redirect_uri', redirectUri)
  auth.searchParams.set('scope', scope)
  auth.searchParams.set('code_challenge', codeChallenge)
  auth.searchParams.set('code_challenge_method', 'S256')
  auth.searchParams.set('state', state)
  auth.searchParams.set('nonce', nonce) // ID 토큰에 (원문 또는 해시)로 반영됨
  return auth.toString()
}

export async function exchangeCodeForTokensApple({
  code,
  clientId,
  clientSecret, // 애플은 client_secret(JWT) 필수
  redirectUri,
  codeVerifier,
}: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
  codeVerifier: string
}) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })

  const resp = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok) throw new Error(`token exchange failed: ${resp.status}`)
  return await resp.json<any>()
}

export function decodeJwtPayload(idToken?: string) {
  if (!idToken) return null
  const [, p] = idToken.split('.')
  if (!p) return null
  const json = atob(p.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(json)
}

export async function makePkce() {
  const state = b64urlEncode(crypto.getRandomValues(new Uint8Array(16)))
  const codeVerifier = b64urlEncode(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = b64urlEncode(await sha256(codeVerifier))
  // Apple용 권장: 별도 nonce 생성
  const nonce = b64urlEncode(crypto.getRandomValues(new Uint8Array(16)))
  return { state, codeVerifier, challenge, nonce }
}

// ---- base64url helpers ----
export function b64urlEncode(input: string | ArrayBuffer | Uint8Array): string {
  let bytes: Uint8Array
  if (typeof input === 'string') bytes = new TextEncoder().encode(input)
  else if (input instanceof ArrayBuffer) bytes = new Uint8Array(input)
  else bytes = input
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  const b64 = btoa(bin)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function b64urlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4
  if (pad) b64 += '='.repeat(4 - pad)
  const bin = atob(b64)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

export function b64urlDecodeToString(b64url: string): string {
  return new TextDecoder().decode(b64urlToBytes(b64url))
}

// ---- crypto helpers ----
export async function sha256(input: string | Uint8Array) {
  const enc = new TextEncoder()
  const data = input instanceof Uint8Array ? input : enc.encode(input)
  return await crypto.subtle.digest('SHA-256', data)
}

async function importHmacKey(secret: string) {
  const enc = new TextEncoder()
  return await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function hmacSign(env: Env, data: string) {
  const key = await importHmacKey('test')
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return b64urlEncode(sig)
}

export async function hmacVerify(env: Env, data: string, sigB64Url: string) {
  const key = await importHmacKey('test')
  const sig = b64urlToBytes(sigB64Url)
  return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data))
}

// ---- cookies ----
export function parseCookies(header?: string | null) {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const [k, v] = part.trim().split('=')
    if (!k) continue
    out[k] = decodeURIComponent(v || '')
  }
  return out
}

export function makeCookie(
  name: string,
  value: string,
  opts: { httpOnly?: boolean; path?: string; secure?: boolean; sameSite?: 'Lax' | 'Strict' | 'None'; maxAge?: number; domain?: string } = {}
) {
  const { httpOnly = true, path = '/', secure = true, sameSite = 'Lax', maxAge, domain } = opts
  let cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`
  if (domain) cookie += `; Domain=${domain}`
  if (secure) cookie += '; Secure'
  if (httpOnly) cookie += '; HttpOnly'
  if (maxAge != null) cookie += `; Max-Age=${maxAge}`
  return cookie
}

export function headersWithCookies(base?: HeadersInit, cookies: string[] = []) {
  const h = new Headers(base)
  for (const c of cookies) h.append('Set-Cookie', c)
  return h
}

// ---- session ----
export async function makeSessionCookie(env: Env, user: any, request: Request, opts?: { sameSite?: 'Lax' | 'None'; domain?: string }) {
  const ttlDays = Number(7)
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60
  const payload = b64urlEncode(JSON.stringify({ exp, user }))
  const sig = await hmacSign(env, payload)
  const url = new URL(request.url)
  const secure = url.protocol === 'https:'
  return makeCookie('session', `${payload}.${sig}`, {
    maxAge: ttlDays * 24 * 60 * 60,
    secure,
    sameSite: opts?.sameSite ?? 'Lax',
    domain: opts?.domain,
  })
}

export async function readSession(env: Env, request: Request) {
  const cookies = parseCookies(request.headers.get('Cookie'))
  const raw = cookies['session']
  if (!raw) return null
  const [payload, sig] = raw.split('.')
  if (!payload || !sig) return null
  const ok = await hmacVerify(env, payload, sig).catch(() => false)
  if (!ok) return null
  let json: string
  try {
    json = b64urlDecodeToString(payload)
  } catch {
    return null
  }
  const data = JSON.parse(json)
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null
  return data.user
}

export function clearSessionCookie() {
  return makeCookie('session', '', { maxAge: 0 })
}

export function zParse<T>(schema: z.ZodType<T>, input: unknown) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.message)
  return parsed.data
}

export async function appleOauth2Callback(request: Request, env: Env) {
    const url = new URL(request.url)

  // 1) form_post 방식 우선
  let code: string | null = null
  let stateRaw: string | null = null

  if (request.method === 'POST') {
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('application/x-www-form-urlencoded')) {
      const body = await request.text()
      const params = new URLSearchParams(body)
      code = params.get('code')
      stateRaw = params.get('state')
    }
  }

  // 2) fallback: query string 처리
  if (!code || !stateRaw) {
    code = url.searchParams.get('code')
    stateRaw = url.searchParams.get('state')
  }

  if (!code || !stateRaw) {
    return jsonWithCors({ error: 'Missing code or state' }, 400)
  }

  // 1) state 파싱 및 기본 검증
  let parsed: StatePayload
  try {
    parsed = fromBase64UrlToJSON<StatePayload>(stateRaw)
  } catch {
    return jsonWithCors({ error: 'Invalid state' }, 400)
  }
  const { s: csrf, t: txnId, p: providerFromState } = parsed || ({} as StatePayload)
  if (!csrf || !txnId) return jsonWithCors({ error: 'Invalid state payload' }, 400)

  // 2) TXN 조회 및 검증
  const txnKey = `txn:${txnId}`
  const txnJSON = await env.TXNS.get(txnKey)
  if (!txnJSON) return jsonWithCors({ error: 'Transaction expired' }, 400)
  const txn = JSON.parse(txnJSON) as TxnRecord

  if (txn.csrf !== csrf) return jsonWithCors({ error: 'CSRF mismatch' }, 400)

  // 5) 토큰 교환
  const clientSecret = await makeAppleClientSecret({
    teamId: env.APPLE_TEAM_ID,
    keyId: env.APPLE_KEY_ID,
    clientId: env.APPLE_CLIENT_ID,
    privateKeyPem: env.APPLE_PRIVATE_KEY_PEM,
  })

  const token = await exchangeCodeForTokensApple({
    code: code,
    clientId: env.APPLE_CLIENT_ID,
    clientSecret,
    redirectUri: env.APPLE_REDIRECT_URI,
    codeVerifier: txn.code_verifier,
  }).catch((e: any) => ({ error: e?.message || 'exchange_failed' }))

  if ((token as any).error) {
    return Response.json({ error: (token as any).error }, { status: 400 })
  }

  // 6) ID 토큰 디코드
  const id = decodeJwtPayload((token as any).id_token) || {}
  const user = {
    sub: id.sub,
    email: id.email,
    email_verified: id.email_verified,
    name: id.name,
    picture: null,
  }

  // 7) 세션 쿠키 발급
  const sessionCookie = await makeSessionCookie(env, user, request, { sameSite: 'Lax' })

  const wantsJson = url.searchParams.get('format') === 'json'
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true, user }, null, 2), {
      status: 200,
      headers: headersWithCookies(
        { 'content-type': 'application/json; charset=UTF-8' },
        [sessionCookie]
      ),
    })
  }

  return new Response(null, {
    status: 302,
    headers: headersWithCookies({ Location: '/' }, [sessionCookie]),
  })
}