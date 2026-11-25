import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {InsightsBlockDisabledQuery} from '../../../__generated__/InsightsBlockDisabledQuery.graphql'
import {InsightsBlockDisabledNotice} from './InsightsBlockDisabledNotice'

const query = graphql`
  query InsightsBlockDisabledQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        organization {
          ...InsightsBlockDisabledNotice_organization
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<InsightsBlockDisabledQuery>
}

export const InsightsBlockDisabled = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<InsightsBlockDisabledQuery>(query, queryRef)
  return <InsightsBlockDisabledNotice organizationRef={data.viewer.team?.organization ?? null} />
}
