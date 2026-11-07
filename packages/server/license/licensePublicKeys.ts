/*
The public halves of the keys Parabol signs licenses with, by key ID (a license's `kid`). The private halves never
leave Parabol. Add a key here before signing with it, and keep a retired key while licenses it signed are in use.
*/
export const licensePublicKeys: Record<string, string> = {}
