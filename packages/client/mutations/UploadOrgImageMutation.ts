import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

const mutation = graphql`
  mutation UploadOrgImageMutation($file: File!, $orgId: ID!) {
    uploadOrgImage(file: $file, orgId: $orgId)
  }
`

const UploadOrgImageMutation = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  const {file} = variables
  const uploadables = file ? {file} : undefined
  return commitMutation(atmosphere, {
    mutation,
    variables,
    uploadables,
    onCompleted,
    onError
  })
}

export default UploadOrgImageMutation
