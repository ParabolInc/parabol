import ms from 'ms'
import type {ClickUpApiWorkspace} from './ClickUpApiTypes'
import readClickUpCached, {type ClickUpCacheAuth} from './readClickUpCached'

const WORKSPACES_MAX_AGE = ms('5m')

export class ClickUpNoWorkspaceError extends Error {
  constructor() {
    super('No ClickUp workspace is shared with Parabol. Reconnect ClickUp and select a workspace')
  }
}

const listClickUpWorkspaces = (auth: ClickUpCacheAuth) =>
  readClickUpCached<{teams?: ClickUpApiWorkspace[]}, ClickUpApiWorkspace[]>(
    auth,
    '/team',
    {},
    WORKSPACES_MAX_AGE,
    ({teams = []}) => (teams.length > 0 ? teams : new ClickUpNoWorkspaceError())
  )

export default listClickUpWorkspaces
