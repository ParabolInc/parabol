import type {AddReactjiToReactablePayloadResolvers, ReactableEnum} from '../../public/resolverTypes'
import {getReactable} from '../mutations/addReactjiToReactable'

export type AddReactjiToReactablePayloadSource = {
  reactableId: string | number
  reactableType: ReactableEnum
}

const AddReactjiToReactablePayload: AddReactjiToReactablePayloadResolvers = {
  reactable: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
    return getReactable(reactableId, reactableType, dataLoader) as any
  }
}

export default AddReactjiToReactablePayload
