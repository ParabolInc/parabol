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
    const {onCompleted, ...rest} = config
    return commit({
      ...rest,
      // always surface the mutation error; callers layer their own handling
      // (e.g. reverting an optimistic flip) through their onCompleted
      onCompleted: (res, errors) => {
        const error = res.updateUserTheme.error
        if (error) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'updateUserThemeError'
          })
        }
        onCompleted?.(res, errors)
      }
    })
  }
  return [execute, submitting] as const
}

export default useUpdateUserThemeMutation
