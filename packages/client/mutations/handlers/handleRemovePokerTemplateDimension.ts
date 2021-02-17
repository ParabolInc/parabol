import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import {IPokerMeetingSettings} from '~/types/graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemovePokerTemplateDimension = (
  dimensionId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord<IPokerMeetingSettings>('meetingSettings', {
    meetingType: 'poker'
  })
  if (!settings) return
  const selectedTemplate = settings.getLinkedRecord('selectedTemplate')
  if (!selectedTemplate) return
  safeRemoveNodeFromArray(dimensionId, selectedTemplate, 'dimensions')
}

const handleRemovePokerTemplateDimensions = pluralizeHandler(handleRemovePokerTemplateDimension)
export default handleRemovePokerTemplateDimensions
