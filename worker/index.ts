import { oauth2Callback } from './handlers/callback'
import { oauth2Login } from './handlers/login'
import { oauth2Logout } from './handlers/logout'
import { oauth2Me } from './handlers/me'
import { oauth2Start } from './handlers/start'

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
    if (url.pathname === '/oauth2/start/google') return oauth2Start(request, env, 'google', oauth2Providers, env.GOOGLE_REDIRECT_URI)
    if (url.pathname === '/oauth2/callback/google') return oauth2Callback(request, env, 'google', oauth2Providers, env.GOOGLE_REDIRECT_URI, env.GOOGLE_REDIRECT_TO)
    if (url.pathname === '/oauth2/login/google') return oauth2Login(request, env, oauth2Providers, 'google')
    if (url.pathname === '/oauth2/me') return oauth2Me(request, env, oauth2Providers)
    if (url.pathname === '/oauth2/logout') return oauth2Logout(request, env, oauth2Providers)

    return new Response('Not Found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
