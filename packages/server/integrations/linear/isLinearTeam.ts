import type {LinearRepo, LinearTeam} from '../platform/RemoteRepoIntegration'

/** A cached Linear team is keyed on itself; a project carries the team it belongs to */
const isLinearTeam = (repo: LinearRepo): repo is LinearTeam => repo.id === repo.teamId

export default isLinearTeam
