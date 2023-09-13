import React, {Suspense} from 'react'
import {
  IsOneOnOneTeamExistsComponentQuery,
  CreateOneOnOneTeamInput
} from '../../__generated__/IsOneOnOneTeamExistsComponentQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {LoaderSize} from '../../types/constEnums'
import IsOneOnOneTeamExistsComponent, {
  isOneOnOneExistsComponentQuery
} from './IsOneOnOneTeamExistsComponent'

interface Props {
  oneOnOneTeamInput: CreateOneOnOneTeamInput
  name: string
}

const IsOneOnOneTeamExists = ({oneOnOneTeamInput, name}: Props) => {
  const queryRef = useQueryLoaderNow<IsOneOnOneTeamExistsComponentQuery>(
    isOneOnOneExistsComponentQuery,
    {
      oneOnOneTeamInput,
      orgId: oneOnOneTeamInput.orgId
    }
  )
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.MENU})}>
      {queryRef && <IsOneOnOneTeamExistsComponent queryRef={queryRef} name={name} />}
    </Suspense>
  )
}

export default IsOneOnOneTeamExists
