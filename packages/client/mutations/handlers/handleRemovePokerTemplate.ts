import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemovePokerTemplate = (templateId: string, store: RecordSourceSelectorProxy<any>) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const allAvailableConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  safeRemoveNodeFromConn(templateId, allAvailableConn)
}

const handleRemovePokerTemplates = pluralizeHandler(handleRemovePokerTemplate)
export default handleRemovePokerTemplates
