import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {IsOneOnOneTeamExistsQuery} from '../../__generated__/IsOneOnOneTeamExistsQuery.graphql'

export const isOneOnOneExistsQuery = graphql`
  query IsOneOnOneTeamExistsQuery($oneOnOneTeamInput: CreateOneOnOneTeamInput!) {
    isOneOnOneTeamExists(oneOnOneTeamInput: $oneOnOneTeamInput) {
      team {
        id
        name
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<IsOneOnOneTeamExistsQuery>
  name: string
}

const IsOneOnOneTeamExistsComponent = (props: Props) => {
  const {queryRef, name} = props
  const data = usePreloadedQuery<IsOneOnOneTeamExistsQuery>(isOneOnOneExistsQuery, queryRef)

  const team = data.isOneOnOneTeamExists.team

  return (
    <div className='mb-4 text-center text-sm'>
      {team ? `"${team.name}" team will be used` : `A new team will be created for you and ${name}`}
    </div>
  )
}

export default IsOneOnOneTeamExistsComponent
