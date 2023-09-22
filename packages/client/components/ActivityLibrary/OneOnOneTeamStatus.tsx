import React, {Suspense} from 'react'
import {OneOnOneTeamStatusComponentQuery} from '../../__generated__/OneOnOneTeamStatusComponentQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {LoaderSize} from '../../types/constEnums'
import OneOnOneTeamStatusComponent, {
  oneOnOneTeamStatusComponentQuery
} from './OneOnOneTeamStatusComponent'

interface Props {
  email: string
  orgId: string
  name: string
}

const OneOnOneTeamStatus = ({email, orgId, name}: Props) => {
  const queryRef = useQueryLoaderNow<OneOnOneTeamStatusComponentQuery>(
    oneOnOneTeamStatusComponentQuery,
    {email, orgId}
  )
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.MENU})}>
      {queryRef && <OneOnOneTeamStatusComponent queryRef={queryRef} name={name} />}
    </Suspense>
  )
}

export default OneOnOneTeamStatus
