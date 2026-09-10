import type {LinearRepo, LinearTeam} from '../platform/RemoteRepoIntegration'

/** Only projects carry their teams; the stitched __typename is prefixed at runtime so it cannot be compared to the generated literal */
const isLinearTeam = (repo: LinearRepo): repo is LinearTeam => !('teams' in repo)

export default isLinearTeam
