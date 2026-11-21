import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {InsightsBlockDisabledQuery} from '../../../__generated__/InsightsBlockDisabledQuery.graphql'
import {InsightsBlockDisabledNotice} from './InsightsBlockDisabledNotice'

const query = graphql`
  query InsightsBlockDisabledQuery {
    viewer {
      teams {
        id
        orgId
        isOrgAdmin
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<InsightsBlockDisabledQuery>
  teamIds: string[]
}

export const InsightsBlockDisabled = (props: Props) => {
  const {queryRef, teamIds} = props
  const data = usePreloadedQuery<InsightsBlockDisabledQuery>(query, queryRef)
  const team = data.viewer.teams.find(({id}) => teamIds.includes(id))
  return (
    <InsightsBlockDisabledNotice
      orgId={team?.orgId ?? null}
      isOrgAdmin={team?.isOrgAdmin ?? false}
    />
  )
}
