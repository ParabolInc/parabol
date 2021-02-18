import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import {IPokerMeetingSettings, MeetingTypeEnum} from '~/types/graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemovePokerTemplateDimension = (
  dimensionId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord<IPokerMeetingSettings>('meetingSettings', {
    meetingType: MeetingTypeEnum.poker
  })
  if (!settings) return
  const activeTemplate = settings.getLinkedRecord('activeTemplate')
  if (!activeTemplate) return
  safeRemoveNodeFromArray(dimensionId, activeTemplate, 'dimensions')
}

const handleRemovePokerTemplateDimensions = pluralizeHandler(handleRemovePokerTemplateDimension)
export default handleRemovePokerTemplateDimensions
