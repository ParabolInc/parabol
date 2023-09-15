import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {OneOnOneTeamStatusComponentQuery} from '../../__generated__/OneOnOneTeamStatusComponentQuery.graphql'

export const oneOnOneTeamStatusComponentQuery = graphql`
  query OneOnOneTeamStatusComponentQuery(
    $oneOnOneTeamInput: CreateOneOnOneTeamInput!
    $orgId: ID!
  ) {
    viewer {
      organization(orgId: $orgId) {
        oneOnOneTeam(oneOnOneTeamInput: $oneOnOneTeamInput) {
          id
          name
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<OneOnOneTeamStatusComponentQuery>
  name: string
}

const OneOnOneTeamStatusComponent = (props: Props) => {
  const {queryRef, name} = props
  const data = usePreloadedQuery<OneOnOneTeamStatusComponentQuery>(
    oneOnOneTeamStatusComponentQuery,
    queryRef
  )

  const team = data.viewer.organization?.oneOnOneTeam

  return (
    <div className='mb-4 text-center text-sm'>
      {team ? `"${team.name}" team will be used` : `A new team will be created for you and ${name}`}
    </div>
  )
}

export default OneOnOneTeamStatusComponent
