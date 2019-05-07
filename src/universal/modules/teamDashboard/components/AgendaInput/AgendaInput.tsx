import {AgendaInput_team} from '__generated__/AgendaInput_team.graphql'
import React, {useCallback, useRef} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useAtmosphereListener from 'universal/hooks/useAtmosphereListener'
import useHotkey from 'universal/hooks/useHotkey'
import useMutationProps from 'universal/hooks/useMutationProps'
import AddAgendaItemMutation from 'universal/mutations/AddAgendaItemMutation'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles'
import {meetingSidebarGutter} from 'universal/styles/meeting'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import getNextSortOrder from 'universal/utils/getNextSortOrder'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import useForm from 'universal/utils/relay/useForm'

const AgendaInputBlock = styled('div')({
  padding: `${meetingSidebarGutter} 0`,
  position: 'relative'
})

const InputForm = styled('form')(({disabled}: {disabled: boolean}) => ({
  backgroundColor: 'transparent',
  color: appTheme.palette.cool,
  fontSize: appTheme.typography.s3,
  padding: `0 ${meetingSidebarGutter}`,
  position: 'relative',
  width: '100%',
  zIndex: 100,
  ':hover': {
    backgroundColor: disabled ? 'transparent' : undefined
  }
}))

const inputPlaceholderStyles = makePlaceholderStyles(appTheme.palette.warm)

const InputField = styled('input')(
  {
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    boxShadow: 'none',
    color: appTheme.palette.warm,
    cursor: 'not-allowed',
    display: 'block',
    fontSize: appTheme.typography.s3,
    fontWeight: 400,
    lineHeight: '1.5rem',
    margin: 0,
    outline: 'none',
    padding: '.5rem .5rem .5rem 3rem',
    position: 'relative',
    textIndent: '.1875rem',
    width: '100%',
    zIndex: 200,
    ...makeFieldColorPalette('primary', false),
    ...inputPlaceholderStyles
  },
  ({disabled}: {disabled: boolean}) => {
    return (
      !disabled && {
        cursor: 'text',
        ...makeFieldColorPalette('primary', true)
      }
    )
  }
)

const StyledIcon = styled(Icon)({
  color: appTheme.palette.warm70l,
  display: 'block',
  left: '1.625rem',
  pointerEvents: 'none',
  position: 'absolute',
  top: '.5625rem',
  zIndex: 200
})

interface Props {
  disabled: boolean
  team: AgendaInput_team
}

const AgendaInput = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const focusInput = useCallback(() => {
    inputRef.current && inputRef.current.focus()
  }, [])
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
  const {disabled, team} = props
  const {id: teamId, agendaItems} = team

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = value.trim()
    if (submitting || !content) return
    submitMutation()
    const newAgendaItem = {
      content,
      sortOrder: getNextSortOrder(agendaItems),
      teamId,
      teamMemberId: toTeamMemberId(teamId, atmosphere.viewerId)
    }
    resetValue()
    focusInput()
    AddAgendaItemMutation(atmosphere, newAgendaItem, onError, onCompleted)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && inputRef.current) {
      inputRef.current.blur()
    }
  }

  const showTooltip = Boolean(agendaItems.length > 0 && !disabled)
  return (
    <AgendaInputBlock>
      <Tooltip
        delay={1000}
        hideOnFocus
        tip={
          <div style={{textAlign: 'center'}}>
            {'Add meeting topics to discuss,'}
            <br />
            {'like “upcoming vacation”'}
          </div>
        }
        maxHeight={52}
        maxWidth={224}
        originAnchor={{vertical: 'top', horizontal: 'center'}}
        targetAnchor={{vertical: 'bottom', horizontal: 'center'}}
        isDisabled={!showTooltip}
      >
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
            innerRef={inputRef}
            type='text'
            value={value}
          />
          <StyledIcon>add_circle</StyledIcon>
        </InputForm>
      </Tooltip>
    </AgendaInputBlock>
  )
}

export default createFragmentContainer(
  AgendaInput,
  graphql`
    fragment AgendaInput_team on Team {
      id
      agendaItems {
        sortOrder
      }
    }
  `
)
