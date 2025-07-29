import type {Selectable} from 'kysely'
import TeamNotificationSettingsId from '../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import type {TeamNotificationSettings as TeamNotificationSettingsDB} from '../../../postgres/types/pg'
import type {TeamNotificationSettingsResolvers} from '../resolverTypes'

export type TeamNotificationSettingsSource = Selectable<TeamNotificationSettingsDB>

const TeamNotificationSettings: TeamNotificationSettingsResolvers = {
  id: ({id}) => TeamNotificationSettingsId.join(id)
}

export default TeamNotificationSettings
