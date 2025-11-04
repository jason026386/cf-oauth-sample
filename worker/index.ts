import { oauth2Callback, oauth2Login, oauth2Logout, oauth2Me, oauth2Start } from 'cf-oauth'

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
    }
    if (url.pathname === '/api/oauth2/start/google') return oauth2Start(request, env, 'google', oauth2Providers, env.GOOGLE_REDIRECT_URI)
    if (url.pathname === '/api/oauth2/callback/google') return oauth2Callback(request, env, 'google', oauth2Providers, env.GOOGLE_REDIRECT_URI, env.GOOGLE_REDIRECT_TO)
    if (url.pathname === '/api/oauth2/login/google') return oauth2Login(request, env, oauth2Providers, 'google')
    if (url.pathname === '/api/oauth2/me') return oauth2Me(request, env, oauth2Providers)
    if (url.pathname === '/api/oauth2/logout') return oauth2Logout(request, env, oauth2Providers)

    return new Response('Not Found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
