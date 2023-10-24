import {FixedActivityResolvers} from '../resolverTypes'
import {getIllustrationUrlForActivity} from './helpers/getIllustrationUrlForActivity'

const FixedActivity: FixedActivityResolvers = {
  __isTypeOf: ({type}) => type === 'teamPrompt' || type === 'action',
  illustrationUrl: ({id: activityId}) => {
    return getIllustrationUrlForActivity(activityId)
  },
  isRecommended: () => true
}

export default FixedActivity
