export type SessionRecord = {
  provider: string
  created_at: number
  user: {
    sub: string
    email?: string
    name?: string
    picture?: string
    email_verified?: boolean
  }
  token: {
    access_token?: string
    refresh_token?: string
    id_token_hint: true
    expires_in?: number
  }
}
