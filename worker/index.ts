import { makeAppleClientSecret, oauth2Callback, oauth2Login, oauth2Logout, oauth2Me, oauth2Start } from 'cf-oauth'
import { appleOauth2Callback } from './handlers/callback'

export default {
  async fetch(request, env, ctx): Promise<Response> {

    const url = new URL(request.url)

    // OAuth2
    const oauth2Providers = {
      google: {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
        token_url: 'https://oauth2.googleapis.com/token',
        userinfo_url: 'https://openidconnect.googleapis.com/v1/userinfo',
        scope: 'openid email profile',
        oidc: {
          issuer: 'https://accounts.google.com',
          discovery: 'https://accounts.google.com/.well-known/openid-configuration',
          require_email_verified: false,
        }
      },
      apple: {
        client_id: env.APPLE_CLIENT_ID,
        client_secret: await makeAppleClientSecret({
          teamId: env.APPLE_TEAM_ID,
          keyId: env.APPLE_KEY_ID,
          clientId: env.APPLE_CLIENT_ID,
          privateKeyPem: env.APPLE_PRIVATE_KEY_PEM,
        }),
        auth_url: 'https://appleid.apple.com/auth/authorize',
        response_mode: 'form_post',
        token_url: 'https://appleid.apple.com/auth/token',
        userinfo_url: '',
        scope: 'openid email name',
        oidc: {
          issuer: 'https://appleid.apple.com',
          discovery: 'https://appleid.apple.com/.well-known/openid-configuration',
          require_email_verified: true,
        },
      },
    }

    if (url.pathname === '/api/oauth2/start/google') return oauth2Start(request, env, 'google', oauth2Providers, env.GOOGLE_REDIRECT_URI)
    if (url.pathname === '/api/oauth2/callback/google') return oauth2Callback(request, env, 'google', oauth2Providers, env.GOOGLE_REDIRECT_URI, env.OAUTH_REDIRECT_TO)
    if (url.pathname === '/api/oauth2/login/google') return oauth2Login(request, env, oauth2Providers, 'google')

    if (url.pathname === '/api/oauth2/start/apple') return oauth2Start(request, env, 'apple', oauth2Providers, env.APPLE_REDIRECT_URI)
    if (url.pathname === '/api/oauth2/callback/apple') return appleOauth2Callback(request, env)
    if (url.pathname === '/api/oauth2/login/apple') return oauth2Login(request, env, oauth2Providers, 'apple')

    if (url.pathname === '/api/oauth2/me') return oauth2Me(request, env, oauth2Providers)
    if (url.pathname === '/api/oauth2/logout') return oauth2Logout(request, env, oauth2Providers)

    return new Response('Not Found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
