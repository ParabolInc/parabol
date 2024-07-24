import {Selectable} from 'kysely'
import {OrganizationUser as OrganizationUserPG, TeamMember as TeamMemberPG} from '../pg.d'

export type OrganizationUser = Selectable<OrganizationUserPG>

export type TeamMember = Selectable<TeamMemberPG>
