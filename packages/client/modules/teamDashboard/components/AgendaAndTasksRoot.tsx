import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useRouter from '../../../hooks/useRouter'
import agendaAndTasksQuery, {
  AgendaAndTasksQuery
} from '../../../__generated__/AgendaAndTasksQuery.graphql'
import AgendaAndTasks from './AgendaAndTasks/AgendaAndTasks'

const AgendaAndTasksRoot = () => {
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  const queryRef = useQueryLoaderNow<AgendaAndTasksQuery>(agendaAndTasksQuery, {teamId})
  return <Suspense fallback={''}>{queryRef && <AgendaAndTasks queryRef={queryRef} />}</Suspense>
}

export default AgendaAndTasksRoot
