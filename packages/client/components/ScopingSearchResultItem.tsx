import type * as React from 'react'
import type {UpdatePokerScopeMutation as TUpdatePokerScopeMutation} from '../__generated__/UpdatePokerScopeMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {Threshold} from '../types/constEnums'
import isTempId from '../utils/relay/isTempId'
import Checkbox from './Checkbox'
import Ellipsis from './Ellipsis/Ellipsis'

interface Props {
  meetingId: string
  usedServiceTaskIds: Set<string>
  persistQuery?: () => void
  summary: string
  url: string
  linkTitle: string
  linkText: string
  serviceTaskId: string
  service: string
}

const ScopingSearchResultItem = (props: Props) => {
  const {
    meetingId,
    persistQuery,
    usedServiceTaskIds,
    summary,
    url,
    linkTitle,
    linkText,
    serviceTaskId,
    service
  } = props
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation} = useMutationProps()
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const isTemp = isTempId(serviceTaskId)

  const onClick = () => {
    if (disabled || isTemp) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service,
          serviceTaskId,
          action: isSelected ? 'DELETE' : 'ADD'
        }
      ]
    } as TUpdatePokerScopeMutation['variables']
    UpdatePokerScopeMutation(atmosphere, variables, {
      onError,
      onCompleted,
      contents: [summary]
    })
    if (!isSelected) {
      // if they are adding an item, then their search criteria must be good, so persist it
      persistQuery?.()
    }
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // don't propagate or the checkbox will be toggled
    e.stopPropagation()
  }

  return (
    <div className='flex cursor-pointer py-2 pl-4' onClick={onClick}>
      <Checkbox active={isSelected || isTemp} disabled={disabled} />
      <div className='flex flex-col pl-4'>
        <div>{summary}</div>
        <a
          className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'
          href={url}
          rel='noopener noreferrer'
          target='_blank'
          title={linkTitle}
          onClick={handleLinkClick}
        >
          {linkText}
          {isTemp && <Ellipsis />}
        </a>
      </div>
    </div>
  )
}

export default ScopingSearchResultItem
