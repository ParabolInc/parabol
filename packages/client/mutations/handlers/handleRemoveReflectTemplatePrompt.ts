import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import {IRetrospectiveMeetingSettings} from '~/types/graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemoveReflectTemplatePrompt = (
  promptId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord<IRetrospectiveMeetingSettings>('meetingSettings', {
    meetingType: 'retrospective'
  })
  if (!settings) return
  const selectedTemplate = settings.getLinkedRecord('selectedTemplate')
  if (!selectedTemplate) return
  safeRemoveNodeFromArray(promptId, selectedTemplate, 'prompts')
}

const handleRemoveReflectTemplatePrompts = pluralizeHandler(handleRemoveReflectTemplatePrompt)
export default handleRemoveReflectTemplatePrompts
