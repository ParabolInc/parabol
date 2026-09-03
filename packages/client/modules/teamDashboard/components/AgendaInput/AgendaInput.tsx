import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import {Add} from '~/ui/icons'
import type {AgendaInput_team$key} from '../../../../__generated__/AgendaInput_team.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAtmosphereListener from '../../../../hooks/useAtmosphereListener'
import useForm from '../../../../hooks/useForm'
import useHotkey from '../../../../hooks/useHotkey'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddAgendaItemMutation from '../../../../mutations/AddAgendaItemMutation'
import {positionAfter} from '../../../../shared/sortOrder'
import {cn} from '../../../../ui/cn'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import toTeamMemberId from '../../../../utils/relay/toTeamMemberId'

interface Props {
  className?: string
  disabled: boolean
  team: AgendaInput_team$key
}

const AgendaInput = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const focusInput = (e?: React.KeyboardEvent | KeyboardEvent) => {
    e && e.preventDefault()
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.scrollIntoViewIfNeeded()
    }
  }
  useHotkey('+', focusInput)
  const {fields, onChange} = useForm({
    newItem: {
      getDefault: () => ''
    }
  })
  useAtmosphereListener('focusAgendaInput', focusInput)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const {newItem} = fields
  const {resetValue, value} = newItem
  const {className, disabled, team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment AgendaInput_team on Team {
        id
        agendaItems {
          sortOrder
        }
      }
    `,
    teamRef
  )
  const {id: teamId, agendaItems} = team

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = value.trim()
    if (submitting || !content) return
    submitMutation()
    const newAgendaItem = {
      content,
      pinned: false,
      sortOrder: positionAfter(agendaItems.at(-1)?.sortOrder ?? ''),
      teamId,
      teamMemberId: toTeamMemberId(teamId, atmosphere.viewerId)
    }
    resetValue()
    // setTimeout required when going from 0 to 1 agenda items
    setTimeout(focusInput)
    AddAgendaItemMutation(atmosphere, {newAgendaItem}, {onError, onCompleted})
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && inputRef.current) {
      inputRef.current.blur()
    }
  }
  const isTooltipDisabled = agendaItems.length > 0 || disabled
  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>
        <div className={cn('relative py-2', className)}>
          <form className='relative w-full bg-transparent pl-2 text-[14px]' onSubmit={handleSubmit}>
            <input
              className={cn(
                'relative m-0 block w-full appearance-none rounded-[4px] border border-transparent bg-transparent py-2 pr-2 pl-[43px] indent-1 font-normal font-sans text-[14px] text-fg-primary leading-6 shadow-none outline-none selection:bg-hairline-strong placeholder:text-accent',
                disabled
                  ? 'cursor-not-allowed'
                  : 'cursor-text hover:border-accent focus:border-accent active:border-accent'
              )}
              autoCapitalize='off'
              autoComplete='off'
              disabled={disabled}
              maxLength={63}
              name='newItem'
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder='Add Agenda Topic…'
              ref={inputRef}
              type='text'
              value={value}
            />
            <Add className='pointer-events-none absolute top-[9px] left-4 block text-accent' />
          </form>
        </div>
      </TooltipTrigger>
      {!isTooltipDisabled && (
        <TooltipContent side='bottom'>
          {'Add meeting topics to discuss,'}
          <br />
          {'like “upcoming vacation”'}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

export default AgendaInput
