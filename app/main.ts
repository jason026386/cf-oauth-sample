import { el } from '@webtaku/el'

const urlParams = new URLSearchParams(window.location.search)
let sid = urlParams.get('session')
if (sid) localStorage.setItem('sid', sid)
else sid = localStorage.getItem('sid')

let meData: {
  ok?: boolean
  user?: {
    sub?: string
    id?: string
    email?: string
    name?: string
    picture?: string
  }
  provider?: string
  token_expires_in?: number
} | undefined

if (sid) {
  const res = await fetch('/api/oauth2/me', {
    headers: {
      'Authorization': `Bearer ${sid}`,
      'Content-Type': 'application/json',
    }
  })
  const data = await res.json()
  if (data.ok) meData = data
}

document.body.append(
  el('h1', 'Hello World'),
  ...(meData ? [
    el('p', `Hello ${meData.user?.name}`),
    el('button', 'Logout', {
      onclick: async () => {
        await fetch('/api/oauth2/logout', {
          headers: {
            'Authorization': `Bearer ${sid}`,
            'Content-Type': 'application/json',
          }
        })
        localStorage.removeItem('sid')
        meData = undefined
        window.location.reload()
      }
    }),
  ] : [el('button', 'Login with Google', {
    onclick: () => {
      window.location.href = '/api/oauth2/start/google'
    }
  })])
)
