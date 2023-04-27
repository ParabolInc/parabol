import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import IntegrationBanner from './IntegrationBanner'
import integrationBannerQuery, {
  IntegrationBannerQuery
} from '../../__generated__/IntegrationBannerQuery.graphql'
import {EditorState} from 'draft-js'

interface Props {
  teamId: string
  editorState: EditorState
}

const IntegrationBannerRoot = (props: Props) => {
  const {teamId, editorState} = props
  const queryRef = useQueryLoaderNow<IntegrationBannerQuery>(integrationBannerQuery, {
    teamId
  })

  return (
    <Suspense fallback={''}>
      {queryRef && (
        <IntegrationBanner teamId={teamId} queryRef={queryRef} editorState={editorState} />
      )}
    </Suspense>
  )
}

export default IntegrationBannerRoot
