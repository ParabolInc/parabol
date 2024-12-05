import {isDraftJSContent} from '../../../../client/shared/tiptap/isDraftJSContent'
import {convertKnownDraftToTipTap} from '../../../utils/convertToTipTap'
import {CheckInPhaseResolvers} from '../resolverTypes'

const CheckInPhase: CheckInPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'checkin',
  checkInQuestion: async ({checkInQuestion}) => {
    const contentJSON = JSON.parse(checkInQuestion)
    if (!isDraftJSContent(contentJSON)) return checkInQuestion
    // this is Draft-JS Content. convert it and send it down
    // We can get rid of this resolver once we migrate legacy draft-js content to TipTap
    const tipTapContent = convertKnownDraftToTipTap(contentJSON)
    return JSON.stringify(tipTapContent)
  }
}

export default CheckInPhase
