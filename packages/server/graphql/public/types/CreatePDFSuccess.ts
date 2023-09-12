import {CreatePDFSuccessResolvers} from '../resolverTypes'

export type CreatePDFSuccessSource = {
  pdfBase64: string
}

const CreatePDFSuccess: CreatePDFSuccessResolvers = {
  pdfBase64: async ({pdfBase64}) => {
    return pdfBase64
  }
}

export default CreatePDFSuccess
