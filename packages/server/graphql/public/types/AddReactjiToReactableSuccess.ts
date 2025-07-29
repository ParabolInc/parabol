import type {AddReactjiToReactableSuccessResolvers, ReactableEnum} from '../../public/resolverTypes'
import {getReactable} from '../mutations/addReactjiToReactable'

export type AddReactjiToReactableSuccessSource = {
  reactableId: string | number
  reactableType: ReactableEnum
}

const AddReactjiToReactableSuccess: AddReactjiToReactableSuccessResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return getReactable(reactableId, reactableType, dataLoader) as any
  }
}

export default AddReactjiToReactableSuccess
