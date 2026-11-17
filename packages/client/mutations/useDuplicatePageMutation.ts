import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useDuplicatePageMutation as TDuplicatePageMutation} from '../__generated__/useDuplicatePageMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'
import {handleCreatePage} from './useCreatePageMutation'

const mutation = graphql`
  mutation useDuplicatePageMutation($pageId: ID!, $parentPageId: ID) {
    duplicatePage(pageId: $pageId, parentPageId: $parentPageId) {
      page {
        id
        title
        isPrivate
        sortOrder
        teamId
        parentPageId
        ...LeftNavPageLink_page
      }
    }
  }
`

export const useDuplicatePageMutation = () => {
  const [commit, submitting] = useMutation<TDuplicatePageMutation>(mutation)
  const atmosphere = useAtmosphere()
  const inFlightRef = useRef(false)
  const execute = (config: UseMutationConfig<TDuplicatePageMutation>) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    const onError = config.onError ?? snackOnError(atmosphere, 'duplicatePage')
    return commit({
      updater: (store) => {
        const page = store.getRootField('duplicatePage')?.getLinkedRecord('page')
        if (page) handleCreatePage(page, {store})
      },
      ...config,
      onCompleted: (response, errors) => {
        inFlightRef.current = false
        config.onCompleted?.(response, errors)
      },
      onError: (error) => {
        inFlightRef.current = false
        onError(error)
      }
    })
  }
  return [execute, submitting] as const
}

export type DuplicateExecute = ReturnType<typeof useDuplicatePageMutation>[0]
