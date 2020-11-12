import {RecordSourceSelectorProxy} from 'relay-runtime'
import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

const handleRemovePokerTemplateScale = (
  scaleId: string,
  teamId: string,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)!
  safeRemoveNodeFromArray(scaleId, team, 'scales')
}

const handleRemovePokerTemplateScales = pluralizeHandler(handleRemovePokerTemplateScale)
export default handleRemovePokerTemplateScales
