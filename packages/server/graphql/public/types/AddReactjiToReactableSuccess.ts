import {ReactableEnumType} from '../../types/ReactableEnum'
import {AddReactjiToReactableSuccessResolvers} from '../../public/resolverTypes'

export type AddReactjiToReactableSuccessSource = {
  reactableId: string
  reactableType: ReactableEnumType
  addedKudosId: number
}
const AddReactjiToReactableSuccess: AddReactjiToReactableSuccessResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('reactables').load({id: reactableId, type: reactableType})
  },
  addedKudos: async ({addedKudosId}, _args: unknown, {dataLoader}) => {
    if (!addedKudosId) return null
    return dataLoader.get('kudoses').load(addedKudosId)
  }
}

export default AddReactjiToReactableSuccess
