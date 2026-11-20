import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {useMarkReportsViewed_viewer$key} from '../../__generated__/useMarkReportsViewed_viewer.graphql'
import useMarkReportsViewedMutation from '../../mutations/useMarkReportsViewedMutation'

const useMarkReportsViewed = (viewerRef: useMarkReportsViewed_viewer$key, orgId: string) => {
  const {organizations} = useFragment(
    graphql`
      fragment useMarkReportsViewed_viewer on User {
        organizations {
          id
        }
      }
    `,
    viewerRef
  )
  const isViewerOnOrg = organizations.some(({id}) => id === orgId)
  const [markReportsViewed] = useMarkReportsViewedMutation()
  useEffect(() => {
    if (isViewerOnOrg) markReportsViewed({variables: {orgId}})
  }, [orgId, isViewerOnOrg])
}

export default useMarkReportsViewed
