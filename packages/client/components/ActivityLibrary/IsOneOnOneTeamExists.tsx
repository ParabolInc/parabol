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
  name: string
}

const IsOneOnOneTeamExistsComponent = (props: ComponentProps) => {
  const {queryRef, name} = props
  const data = usePreloadedQuery<IsOneOnOneTeamExistsQuery>(isOneOnOneExistsQuery, queryRef)

  const team = data.isOneOnOneTeamExists.team

  return (
    <div className='mb-4 text-center text-sm'>
      {team ? `"${team.name}" team will be used` : `A new team will be created for you and ${name}`}
    </div>
  )
}

interface Props {
  oneOnOneTeamInput: CreateOneOnOneTeamInput
  name: string
}

const IsOneOnOneTeamExists = ({oneOnOneTeamInput, name}: Props) => {
  const queryRef = useQueryLoaderNow<IsOneOnOneTeamExistsQuery>(isOneOnOneExistsQuery, {
    oneOnOneTeamInput
  })
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.MENU})}>
      {queryRef && <IsOneOnOneTeamExistsComponent queryRef={queryRef} name={name} />}
    </Suspense>
  )
}

export default IsOneOnOneTeamExists
