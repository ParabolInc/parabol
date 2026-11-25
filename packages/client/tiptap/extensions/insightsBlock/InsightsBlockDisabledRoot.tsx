import {Suspense} from 'react'
import type {InsightsBlockDisabledQuery} from '../../../__generated__/InsightsBlockDisabledQuery.graphql'
import query from '../../../__generated__/InsightsBlockDisabledQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {InsightsBlockDisabled} from './InsightsBlockDisabled'

interface Props {
  teamId: string
}

export const InsightsBlockDisabledRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<InsightsBlockDisabledQuery>(query, {teamId})
  return (
    <Suspense fallback={null}>{queryRef && <InsightsBlockDisabled queryRef={queryRef} />}</Suspense>
  )
}
