import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import {PokerTemplateList_settings$data} from '~/__generated__/PokerTemplateList_settings.graphql'
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
  const settings = team.getLinkedRecord<PokerTemplateList_settings$data>('meetingSettings', {
    meetingType: 'poker'
  })
  safeRemoveNodeFromArray(templateId, settings, 'teamTemplates')
  const orgConn = getPokerTemplateOrgConn(settings)
  const publicConn = getPokerTemplatePublicConn(settings)
  safeRemoveNodeFromConn(templateId, orgConn)
  safeRemoveNodeFromConn(templateId, publicConn)

  const viewer = store.getRoot().getLinkedRecord('viewer')
  const allAvailableConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  safeRemoveNodeFromConn(templateId, allAvailableConn)
}

const handleRemovePokerTemplates = pluralizeHandler(handleRemovePokerTemplate)
export default handleRemovePokerTemplates
