import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import {Redirect} from 'react-router'

const query = graphql`
  query ActivityLibraryQuery {
    viewer {
      featureFlags {
        retrosInDisguise
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<ActivityLibraryQuery>
}

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })

  if (!data.viewer.featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  return <div>Activity Library</div>
}
