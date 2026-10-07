import {useMemo} from 'react'
import useUnusedRecords from '../hooks/useUnusedRecords'
import type {RegisteredClientIntegration} from '../integrations/platform/registry'
import type {ScopingItem} from '../integrations/platform/ScopingSearchState'
import useUpdatePokerScopeMutation from '../mutations/useUpdatePokerScopeMutation'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import Checkbox from './Checkbox'

interface Props {
  items: readonly ScopingItem[]
  usedServiceTaskIds: ReadonlySet<string>
  meetingId: string
  service: RegisteredClientIntegration
  noun: string
  persistQuery?: () => void
}

const IntegrationScopingSelectAll = (props: Props) => {
  const {items, usedServiceTaskIds, meetingId, service, noun, persistQuery} = props
  const [updatePokerScope, submitting] = useUpdatePokerScopeMutation()
  const serviceTaskIds = useMemo(() => items.map((item) => item.serviceTaskId), [items])
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(serviceTaskIds, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updateArr = action === 'DELETE' ? serviceTaskIds : unusedServiceTaskIds
    const updates = updateArr
      .slice(0, limit)
      .map((serviceTaskId) => ({service, serviceTaskId, action}) as const)
    const contents = updates.map(
      ({serviceTaskId}) =>
        items.find((item) => item.serviceTaskId === serviceTaskId)?.summary ?? 'Unknown Story'
    )
    updatePokerScope({variables: {meetingId, updates}, contents, selectedAll: true})
    if (action === 'ADD') {
      persistQuery?.()
    }
  }
  if (items.length < 2) return null
  const title = getSelectAllTitle(
    unusedServiceTaskIds.length,
    usedServiceTaskIds.size,
    noun,
    allSelected
  )
  return (
    <div className='flex cursor-pointer px-4 py-2' onClick={onClick}>
      <Checkbox active={allSelected} />
      <div className='pb-5 pl-4 font-semibold'>{title}</div>
    </div>
  )
}

export default IntegrationScopingSelectAll
