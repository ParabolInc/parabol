import React, {Suspense} from 'react'
import {MenuProps} from '../hooks/useMenu'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import jiraScopingSearchFilterMenuQuery, {
  JiraScopingSearchFilterMenuQuery
} from '../__generated__/JiraScopingSearchFilterMenuQuery.graphql'
import ErrorBoundary from './ErrorBoundary'
import MockFieldList from './MockFieldList'

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingId: string
}

const JiraScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingId} = props
  const queryRef = useQueryLoaderNow<JiraScopingSearchFilterMenuQuery>(
    jiraScopingSearchFilterMenuQuery,
    {teamId, meetingId}
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<MockFieldList />}>
        {queryRef && <JiraScopingSearchFilterMenu queryRef={queryRef} menuProps={menuProps} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default JiraScopingSearchFilterMenuRoot
