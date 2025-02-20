import graphql from 'babel-plugin-relay/macro'
import {useMutation, UseMutationConfig} from 'react-relay'
import {useCreatePageMutation as TCreatePageMutation} from '../__generated__/useCreatePageMutation.graphql'

const mutation = graphql`
  mutation useCreatePageMutation {
    createPage {
      page {
        id
      }
    }
  }
`

export const useCreatePageMutation = () => {
  const [commit, submitting] = useMutation<TCreatePageMutation>(mutation)
  const execute = (config: UseMutationConfig<TCreatePageMutation>) => {
    return commit(config)
  }
  return [execute, submitting] as const
}
