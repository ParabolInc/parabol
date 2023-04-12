import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAtmosphereListener from '../../../../hooks/useAtmosphereListener'
import {MenuPosition} from '../../../../hooks/useCoords'
import useForm from '../../../../hooks/useForm'
import useHotkey from '../../../../hooks/useHotkey'
import useMutationProps from '../../../../hooks/useMutationProps'
import useTooltip from '../../../../hooks/useTooltip'
import AddAgendaItemMutation from '../../../../mutations/AddAgendaItemMutation'
import makeFieldColorPalette from '../../../../styles/helpers/makeFieldColorPalette'
import makePlaceholderStyles from '../../../../styles/helpers/makePlaceholderStyles'
import {PALETTE} from '../../../../styles/paletteV3'
import ui from '../../../../styles/ui'
import getNextSortOrder from '../../../../utils/getNextSortOrder'
import toTeamMemberId from '../../../../utils/relay/toTeamMemberId'
import {AgendaInput_team$key} from '../../../../__generated__/AgendaInput_team.graphql'

const AgendaInputBlock = styled('div')({
  padding: `8px 0`,
  position: 'relative'
})

const InputForm = styled('form')<{disabled: boolean}>(({disabled}) => ({
  backgroundColor: 'transparent',
  fontSize: 14,
  padding: `0 0 0 8px`,
  position: 'relative',
  width: '100%',
  ':hover': {
    backgroundColor: disabled ? 'transparent' : undefined
  }
}))

const inputPlaceholderStyles = makePlaceholderStyles(PALETTE.SKY_500)

const InputField = styled('input')<{disabled: boolean}>(
  {
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    boxShadow: 'none',
    cursor: 'not-allowed',
    display: 'block',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    margin: 0,
    outline: 'none',
    padding: '8px 8px 8px 43px',
    position: 'relative',
    textIndent: '4px',
    width: '100%',
    ...makeFieldColorPalette('cool', false, {backgroundColor: 'transparent'}),
    ...inputPlaceholderStyles
  },
  ({disabled}) => {
    return (
      !disabled && {
        cursor: 'text',
        ...makeFieldColorPalette('cool', true, {backgroundColor: 'transparent'})
      }
    )
  }
)

const StyledIcon = styled(Add)({
  color: PALETTE.SKY_500,
  display: 'block',
  left: 16,
  pointerEvents: 'none',
  position: 'absolute',
  top: 9
})

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
      sortOrder: getNextSortOrder(agendaItems),
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
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: 1000,
      disabled: agendaItems.length > 0 || disabled
    }
  )
  return (
    <AgendaInputBlock
      className={className}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      ref={originRef}
    >
      {tooltipPortal(
        <div style={{textAlign: 'center'}}>
          {'Add meeting topics to discuss,'}
          <br />
          {'like “upcoming vacation”'}
        </div>
      )}
      <InputForm disabled={disabled} onSubmit={handleSubmit}>
        <InputField
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
        <StyledIcon />
      </InputForm>
    </AgendaInputBlock>
  )
}

export default AgendaInput
