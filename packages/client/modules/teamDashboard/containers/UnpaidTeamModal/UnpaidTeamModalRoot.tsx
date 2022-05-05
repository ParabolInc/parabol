import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../../../utils/relay/renderLoader'
import unpaidTeamModalQuery, {
  UnpaidTeamModalQuery
} from '../../../../__generated__/UnpaidTeamModalQuery.graphql'
import UnpaidTeamModal from '../../components/UnpaidTeamModal/UnpaidTeamModal'

interface Props {
  teamId: string
}

const UnpaidTeamModalRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<UnpaidTeamModalQuery>(unpaidTeamModalQuery, {teamId})
  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <UnpaidTeamModal queryRef={queryRef} />}
    </Suspense>
  )
}

export default UnpaidTeamModalRoot
