import {RecordSourceSelectorProxy} from 'relay-runtime'
import {IPokerMeetingSettings} from '../../types/graphql'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getPokerTemplateOrgConn from '../connections/getPokerTemplateOrgConn'
import getPokerTemplatePublicConn from '../connections/getPokerTemplatePublicConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemovePokerTemplate = (
  templateId: string,
  teamId: string,
  store: RecordSourceSelectorProxy<any>
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord<IPokerMeetingSettings>('meetingSettings', {
    meetingType: 'poker'
  })
  safeRemoveNodeFromArray(templateId, settings, 'teamTemplates')
  const orgConn = getPokerTemplateOrgConn(settings)
  const publicConn = getPokerTemplatePublicConn(settings)
  safeRemoveNodeFromConn(templateId, orgConn)
  safeRemoveNodeFromConn(templateId, publicConn)
}

const handleRemovePokerTemplates = pluralizeHandler(handleRemovePokerTemplate)
export default handleRemovePokerTemplates
