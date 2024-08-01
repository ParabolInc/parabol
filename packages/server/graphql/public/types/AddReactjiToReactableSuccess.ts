import {AddReactjiToReactableSuccessResolvers, ReactableEnum} from '../../public/resolverTypes'

export type AddReactjiToReactableSuccessSource = {
  reactableId: string
  reactableType: ReactableEnum
}
const AddReactjiToReactableSuccess: AddReactjiToReactableSuccessResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return await dataLoader.get('reactables').load({id: reactableId, type: reactableType})
  }
}

export default AddReactjiToReactableSuccess
