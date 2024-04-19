import {AddReactjiToReactableSuccessResolvers} from '../../public/resolverTypes'
import {ReactableEnumType} from '../../types/ReactableEnum'

export type AddReactjiToReactableSuccessSource = {
  reactableId: string
  reactableType: ReactableEnumType
  addedKudosId?: number | null
}
const AddReactjiToReactableSuccess: AddReactjiToReactableSuccessResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return await dataLoader.get('reactables').load({id: reactableId, type: reactableType})
  },
  addedKudos: async ({addedKudosId}, _args: unknown, {dataLoader}) => {
    if (!addedKudosId) return null
    return dataLoader.get('kudoses').load(addedKudosId)
  }
}

export default AddReactjiToReactableSuccess
