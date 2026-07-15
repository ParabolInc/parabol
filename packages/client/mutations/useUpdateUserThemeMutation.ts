import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateUserThemeMutation as TUpdateUserThemeMutation} from '../__generated__/useUpdateUserThemeMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

const mutation = graphql`
  mutation useUpdateUserThemeMutation($theme: UserThemeEnum!) {
    updateUserTheme(theme: $theme) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpdateUserThemeSuccess {
        user {
          id
          theme
        }
      }
    }
  }
`

const useUpdateUserThemeMutation = () => {
  const [commit, submitting] = useMutation<TUpdateUserThemeMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateUserThemeMutation>) => {
    return commit({
      onCompleted: (res) => {
        const error = res.updateUserTheme.error
        if (error) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'updateUserThemeError'
          })
        }
      },
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpdateUserThemeMutation
