import { ProviderRegistry } from '../types/provider'
import { StatePayload } from '../types/state'
import { TxnRecord } from '../types/txn'
import { base64url, makePkcePair, randomBytesBase64Url } from '../utils/pkce'
import { jsonWithCors } from '../utils/response'

// --- The Function ---
// Redirects to the provider authorize endpoint with PKCE + state.
// Persists TXN (code_verifier, csrf, return_to...) in KV for 10 minutes.
export async function oauth2Start(
  request: Request,
  env: { TXNS: KVNamespace },
  providerName: string,
  providers: ProviderRegistry,
  redirectUri: string
): Promise<Response> {
  const url = new URL(request.url)

  // 1) Resolve provider
  const cfg = providers[providerName]
  if (!cfg) return jsonWithCors({ error: 'Unknown provider', providerKey: providerName }, 400)

  // 2) Create PKCE + CSRF + TXN
  const pkce = await makePkcePair()
  const csrf = randomBytesBase64Url(32)
  const txnId = randomBytesBase64Url(32)

  const statePayload: StatePayload = { s: csrf, t: txnId, p: providerName, ts: Date.now() }
  const state = base64url(JSON.stringify(statePayload))

  const txn: TxnRecord = {
    provider: providerName,
    code_verifier: pkce.verifier,
    csrf,
    created_at: Date.now(),
    return_to: url.searchParams.get('return_to'),
  }

  // 3) Persist TXN to KV (TTL: 10min)
  await env.TXNS.put(`txn:${txnId}`, JSON.stringify(txn), { expirationTtl: 600 })

  // 4) Build authorize URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.client_id,
    redirect_uri: redirectUri,
    scope: cfg.scope,
    code_challenge: pkce.challenge,
    code_challenge_method: 'S256',
    state,
  })

  // 5) Redirect to provider
  return Response.redirect(`${cfg.auth_url}?${params.toString()}`, 302)
}
