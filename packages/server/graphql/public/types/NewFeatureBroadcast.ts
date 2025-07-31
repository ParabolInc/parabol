import type {NewFeatureBroadcastResolvers} from '../resolverTypes'

const NewFeatureBroadcast: NewFeatureBroadcastResolvers = {
  id: ({id}) => `NewFeature:${id}`
}

export default NewFeatureBroadcast
