import 'react'
import type ScheduledJobMeetingStageTimeLimit from '../database/types/ScheduledJobMetingStageTimeLimit'
import type ScheduledTeamLimitsJob from '../database/types/ScheduledTeamLimitsJob'
declare module 'react' {
  interface TdHTMLAttributes<T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  interface TableHTMLAttributes<T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}

export interface OAuth2Success {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

export interface OAuth2Error {
  error:
    | 'invalid_request'
    | 'invalid_client'
    | 'invalid_grant'
    | 'invalid_scope'
    | 'unauthorized_client'
    | 'unsupported_grant_type'
  error_description?: string
  error_uri?: string
}
export type ScheduledJobUnion = ScheduledJobMeetingStageTimeLimit | ScheduledTeamLimitsJob
