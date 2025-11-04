export type TxnRecord = {
  provider: string
  code_verifier: string
  csrf: string
  created_at: number
  return_to: string | null
}
