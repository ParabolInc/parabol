import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateUserThemeMutation as TUpdateUserThemeMutation} from '../__generated__/useUpdateUserThemeMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useUpdateUserThemeMutation($theme: UserThemeEnum!) {
    updateUserTheme(theme: $theme) {
      user {
        id
        theme
      }
    }
  }
`

const useUpdateUserThemeMutation = () => {
  const [commit, submitting] = useMutation<TUpdateUserThemeMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateUserThemeMutation>) => {
    return commit({
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpdateUserThemeMutation
