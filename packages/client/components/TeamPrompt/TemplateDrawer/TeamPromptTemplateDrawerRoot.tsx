import {Suspense} from 'react'
import teamPromptTemplateDrawerQuery, {
  type TeamPromptTemplateDrawerQuery
} from '~/__generated__/TeamPromptTemplateDrawerQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Spinner} from '../../../ui/Spinner/Spinner'
import TeamPromptTemplateDrawer from './TeamPromptTemplateDrawer'

interface Props {
  meetingId: string
  onClose: () => void
  hideHeader?: boolean
}

const TeamPromptTemplateDrawerRoot = ({meetingId, onClose, hideHeader}: Props) => {
  const queryRef = useQueryLoaderNow<TeamPromptTemplateDrawerQuery>(
    teamPromptTemplateDrawerQuery,
    {meetingId, first: 2000},
    'store-and-network'
  )
  const fallback = (
    <div className='flex h-full w-full justify-center bg-surface-drawer p-6'>
      <Spinner className='h-6 w-6' />
    </div>
  )
  return (
    <Suspense fallback={fallback}>
      {queryRef ? (
        <TeamPromptTemplateDrawer queryRef={queryRef} onClose={onClose} hideHeader={hideHeader} />
      ) : (
        fallback
      )}
    </Suspense>
  )
}

export default TeamPromptTemplateDrawerRoot
