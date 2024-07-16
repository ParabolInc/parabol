import {Selectable} from 'kysely'
import {OrganizationUser as OrganizationUserPG} from '../pg.d'
export type OrganizationUser = Selectable<OrganizationUserPG>
