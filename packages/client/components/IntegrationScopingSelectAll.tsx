import {useMemo} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useUnusedRecords from '../hooks/useUnusedRecords'
import type {RegisteredClientIntegration} from '../integrations/platform/registry'
import type {ScopingItem} from '../integrations/platform/ScopingSearchState'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
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
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const serviceTaskIds = useMemo(() => items.map((item) => item.serviceTaskId), [items])
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(serviceTaskIds, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    submitMutation()
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
    UpdatePokerScopeMutation(
      atmosphere,
      {meetingId, updates},
      {onError, onCompleted, contents, selectedAll: true}
    )
    if (action === 'ADD') {
      persistQuery?.()
    }
  }
  if (items.length < 2) return null
  const title = getSelectAllTitle(items.length, usedServiceTaskIds.size, noun)
  return (
    <div className='flex cursor-pointer px-4 py-2' onClick={onClick}>
      <Checkbox active={allSelected} />
      <div className='flex flex-col pb-5 pl-4 font-semibold'>
        <div>{title}</div>
        {error && <div className='font-semibold text-fg-error'>{error.message}</div>}
      </div>
    </div>
  )
}

export default IntegrationScopingSelectAll
