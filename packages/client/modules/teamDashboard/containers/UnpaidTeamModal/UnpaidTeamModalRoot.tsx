import {Suspense} from 'react'
import unpaidTeamModalQuery, {
  UnpaidTeamModalQuery
} from '../../../../__generated__/UnpaidTeamModalQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../../utils/relay/renderLoader'
import UnpaidTeamModal from '../../components/UnpaidTeamModal/UnpaidTeamModal'

interface Props {
  teamId: string
}

const UnpaidTeamModalRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<UnpaidTeamModalQuery>(unpaidTeamModalQuery, {teamId})
  return (
    <Suspense fallback={<Loader />}>{queryRef && <UnpaidTeamModal queryRef={queryRef} />}</Suspense>
  )
}

export default UnpaidTeamModalRoot
