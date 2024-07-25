import {AddReactjiToReactableSuccessResolvers} from '../../public/resolverTypes'
import {ReactableEnumType} from '../../types/ReactableEnum'

export type AddReactjiToReactableSuccessSource = {
  reactableId: string
  reactableType: ReactableEnumType
}
const AddReactjiToReactableSuccess: AddReactjiToReactableSuccessResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return await dataLoader.get('reactables').load({id: reactableId, type: reactableType})
  }
}

export default AddReactjiToReactableSuccess
