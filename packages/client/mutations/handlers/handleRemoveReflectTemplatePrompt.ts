import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import removeFromRefs from '../../utils/relay/removeFromRefs'
import {IRetrospectiveMeetingSettings, MeetingTypeEnum} from '~/types/graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import getReflectTemplateOrgConn from '../connections/getReflectTemplateOrgConn'
import getReflectTemplatePublicConn from '../connections/getReflectTemplatePublicConn'
import safeRemoveNodeFromConn from '~/utils/relay/safeRemoveNodeFromConn'

const handleRemoveReflectTemplatePrompt = (
  promptId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  const settings = team.getLinkedRecord<IRetrospectiveMeetingSettings>('meetingSettings', {
    meetingType: MeetingTypeEnum.retrospective
  })
  if (!settings) return
  const template = settings.getLinkedRecord('selectedTemplate')
  if (!template) return
  safeRemoveNodeFromArray(promptId, template, 'prompts')
  // const orgConn = getReflectTemplateOrgConn(settings)
  // const publicConn = getReflectTemplatePublicConn(settings)
  // safeRemoveNodeFromConn(promptId, orgConn)
  // safeRemoveNodeFromConn(promptId, publicConn)
  // store.delete(promptId)
  // removeFromRefs(promptId, store, {ReflectTemplate: ['prompts']})
}

const handleRemoveReflectTemplatePrompts = pluralizeHandler(handleRemoveReflectTemplatePrompt)
export default handleRemoveReflectTemplatePrompts
