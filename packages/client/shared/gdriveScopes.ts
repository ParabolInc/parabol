export const GDRIVE_MEET_SCOPE = 'https://www.googleapis.com/auth/drive.meet.readonly'
export const GDRIVE_MEETINGS_SCOPE = 'https://www.googleapis.com/auth/meetings.space.readonly'
export const GDRIVE_OAUTH_SCOPES = `${GDRIVE_MEET_SCOPE} ${GDRIVE_MEETINGS_SCOPE}`

export const hasGdriveMeetingsScope = (scopes: string | null | undefined) =>
  !!scopes && scopes.split(/[\s,]+/).includes(GDRIVE_MEETINGS_SCOPE)
