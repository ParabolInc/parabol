import {CreateGcalEventSuccessResolvers} from '../resolverTypes'

export type CreateGcalEventSuccessSource = {
  gcalLink: string
}

const CreateGcalEventSuccess: CreateGcalEventSuccessResolvers = {
  gcalLink: async ({gcalLink}) => gcalLink
}

export default CreateGcalEventSuccess
