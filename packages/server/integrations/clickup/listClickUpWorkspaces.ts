import type {ClickUpApiWorkspace} from './ClickUpApiTypes'
import clickUpRequest, {type ClickUpRequestAuth} from './clickUpRequest'

const listClickUpWorkspaces = async (
  auth: ClickUpRequestAuth
): Promise<ClickUpApiWorkspace[] | Error> => {
  const res = await clickUpRequest<{teams?: ClickUpApiWorkspace[]}>(auth, '/team')
  return res instanceof Error ? res : (res.teams ?? [])
}

export default listClickUpWorkspaces
