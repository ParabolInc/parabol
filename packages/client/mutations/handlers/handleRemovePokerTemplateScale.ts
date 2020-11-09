import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import {IPokerMeetingSettings, MeetingTypeEnum} from '~/types/graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemovePokerTemplateScale = (
  scaleId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord<IPokerMeetingSettings>('meetingSettings', {
    meetingType: MeetingTypeEnum.poker
  })
  if (!settings) return
  safeRemoveNodeFromArray(scaleId, settings, 'teamScales')
}

const handleRemovePokerTemplateScales = pluralizeHandler(handleRemovePokerTemplateScale)
export default handleRemovePokerTemplateScales
