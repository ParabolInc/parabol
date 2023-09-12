import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreatePDFMutation as TCreatePDFMutation} from '../__generated__/CreatePDFMutation.graphql'

graphql`
  fragment CreatePDFMutation_viewer on CreatePDFSuccess {
    pdfBase64
  }
`

const mutation = graphql`
  mutation CreatePDFMutation($htmlContent: String!) {
    createPDF(htmlContent: $htmlContent) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreatePDFMutation_viewer @relay(mask: false)
    }
  }
`

const CreatePDFMutation: StandardMutation<TCreatePDFMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreatePDFMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreatePDFMutation
