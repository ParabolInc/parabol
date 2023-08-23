import React, {Suspense} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {
  IsOneOnOneTeamExistsQuery,
  CreateOneOnOneTeamInput
} from '../../__generated__/IsOneOnOneTeamExistsQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {LoaderSize} from '../../types/constEnums'

const isOneOnOneExistsQuery = graphql`
  query IsOneOnOneTeamExistsQuery($oneOnOneTeamInput: CreateOneOnOneTeamInput!) {
    isOneOnOneTeamExists(oneOnOneTeamInput: $oneOnOneTeamInput) {
      team {
        id
        name
      }
    }
  }
`

interface ComponentProps {
  queryRef: PreloadedQuery<IsOneOnOneTeamExistsQuery>
}

const IsOneOnOneTeamExistsComponent = (props: ComponentProps) => {
  const {queryRef} = props
  const data = usePreloadedQuery<IsOneOnOneTeamExistsQuery>(isOneOnOneExistsQuery, queryRef)

  const team = data.isOneOnOneTeamExists.team

  return <div>{team ? 'Team already exists' : 'A new team will be created'}</div>
}

interface Props {
  oneOnOneTeamInput: CreateOneOnOneTeamInput
}

const IsOneOnOneTeamExists = ({oneOnOneTeamInput}: Props) => {
  const queryRef = useQueryLoaderNow<IsOneOnOneTeamExistsQuery>(isOneOnOneExistsQuery, {
    oneOnOneTeamInput
  })
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.PANEL})}>
      {queryRef && <IsOneOnOneTeamExistsComponent queryRef={queryRef} />}
    </Suspense>
  )
}

export default IsOneOnOneTeamExists
