export const GDRIVE_MEET_SCOPE = 'https://www.googleapis.com/auth/drive.meet.readonly'
export const GDRIVE_DOCS_SCOPE = 'https://www.googleapis.com/auth/documents.readonly'
export const GDRIVE_OAUTH_SCOPES = `${GDRIVE_MEET_SCOPE} ${GDRIVE_DOCS_SCOPE}`

export const hasGdriveDocsScope = (scopes: string | null | undefined) =>
  !!scopes && scopes.split(/[\s,]+/).includes(GDRIVE_DOCS_SCOPE)
