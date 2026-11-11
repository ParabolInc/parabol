import {Suspense} from 'react'
import type {InsightsBlockDisabledQuery} from '../../../__generated__/InsightsBlockDisabledQuery.graphql'
import query from '../../../__generated__/InsightsBlockDisabledQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../utils/relay/renderLoader'
import {InsightsBlockDisabled} from './InsightsBlockDisabled'

interface Props {
  teamIds: string[]
}

export const InsightsBlockDisabledRoot = (props: Props) => {
  const {teamIds} = props
  const queryRef = useQueryLoaderNow<InsightsBlockDisabledQuery>(query)
  return (
    <Suspense fallback={<Loader />}>
      {queryRef && <InsightsBlockDisabled queryRef={queryRef} teamIds={teamIds} />}
    </Suspense>
  )
}
