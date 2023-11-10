import {ReactableEnumType} from '../../types/ReactableEnum'
import {AddReactjiToReactableSuccessResolvers} from '../../public/resolverTypes'

export type AddReactjiToReactableSuccessSource = {
  reactableId: string
  reactableType: ReactableEnumType
  addedKudosId: string
}
const AddReactjiToReactableSuccess: AddReactjiToReactableSuccessResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('reactables').load({id: reactableId, type: reactableType})
  },
  addedKudos: async ({addedKudosId}) => {
    return null
  }
}

export default AddReactjiToReactableSuccess
