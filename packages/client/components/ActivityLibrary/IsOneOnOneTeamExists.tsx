import React, {Suspense} from 'react'
import {
  IsOneOnOneTeamExistsQuery,
  CreateOneOnOneTeamInput
} from '../../__generated__/IsOneOnOneTeamExistsQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {LoaderSize} from '../../types/constEnums'
import IsOneOnOneTeamExistsComponent, {isOneOnOneExistsQuery} from './IsOneOnOneTeamExistsComponent'

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
