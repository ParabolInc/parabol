import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import {useConfigQuery} from '../__generated__/useConfigQuery.graphql'

export const useConfig = () => {
  const data = useLazyLoadQuery<useConfigQuery>(
    graphql`
      query useConfigQuery {
        config {
          parabolUrl
        }
      }
    `,
    {}
  )
  return data.config
}
