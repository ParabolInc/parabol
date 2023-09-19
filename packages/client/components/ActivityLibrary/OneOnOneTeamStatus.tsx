import React, {Suspense} from 'react'
import {
  OneOnOneTeamStatusComponentQuery,
  CreateOneOnOneTeamInput
} from '../../__generated__/OneOnOneTeamStatusComponentQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {LoaderSize} from '../../types/constEnums'
import OneOnOneTeamStatusComponent, {
  oneOnOneTeamStatusComponentQuery
} from './OneOnOneTeamStatusComponent'

interface Props {
  oneOnOneTeamInput: CreateOneOnOneTeamInput
  name: string
}

const OneOnOneTeamStatus = ({oneOnOneTeamInput, name}: Props) => {
  const queryRef = useQueryLoaderNow<OneOnOneTeamStatusComponentQuery>(
    oneOnOneTeamStatusComponentQuery,
    {
      oneOnOneTeamInput,
      orgId: oneOnOneTeamInput.orgId
    }
  )
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.MENU})}>
      {queryRef && <OneOnOneTeamStatusComponent queryRef={queryRef} name={name} />}
    </Suspense>
  )
}

export default OneOnOneTeamStatus
