import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import AddAgendaItemMutation from 'universal/mutations/AddAgendaItemMutation'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles'
import {meetingSidebarGutter} from 'universal/styles/meeting'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import getNextSortOrder from 'universal/utils/getNextSortOrder'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import withHotkey from 'react-hotkey-hoc'
import {AgendaInput_team} from '__generated__/AgendaInput_team.graphql'

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

interface Props extends WithMutationProps, WithAtmosphereProps {
  afterSubmitAgendaItem: () => void
  bindHotkey: (key: string, cb: (e: KeyboardEvent) => void) => void
  disabled: boolean
  setAgendaInputRef: (c: HTMLInputElement) => void
  team: AgendaInput_team
}

interface State {
  value: string
}

class AgendaInput extends Component<Props, State> {
  state = {
    value: ''
  }

  componentDidMount() {
    const {disabled, bindHotkey} = this.props
    if (!disabled) {
      bindHotkey('+', this.focusOnInput)
    }
  }

  componentWillUpdate() {
    this.maybeSaveFocus()
  }

  componentDidUpdate() {
    this.maybeRefocus()
  }

  innerRef = (c: HTMLInputElement) => {
    const {setAgendaInputRef} = this.props
    this.inputRef = c
    if (setAgendaInputRef) {
      setAgendaInputRef(c)
    }
  }

  inputRef?: HTMLInputElement
  refocusAfterUpdate = false

  focusOnInput = (e) => {
    e.preventDefault()
    if (this.inputRef) {
      this.inputRef.focus()
    }
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const {
      afterSubmitAgendaItem,
      atmosphere,
      team: {agendaItems, teamId},
      submitting,
      submitMutation,
      onError,
      onCompleted
    } = this.props
    const {value} = this.state
    const normalizedValue = value.trim()
    if (submitting || !normalizedValue) return
    submitMutation()

    const handleCompleted = () => {
      onCompleted()
      afterSubmitAgendaItem()
    }

    const newAgendaItem = {
      content: normalizedValue,
      sortOrder: getNextSortOrder(agendaItems),
      teamId,
      teamMemberId: toTeamMemberId(teamId, atmosphere.viewerId)
    }
    this.setState({
      value: ''
    })
    AddAgendaItemMutation(atmosphere, newAgendaItem, onError, handleCompleted)
  }

  onChange = (e) => {
    const {value} = e.target
    this.setState({
      value
    })
  }

  makeForm = () => {
    const {disabled} = this.props
    const {value} = this.state
    return (
      <InputForm disabled={disabled} onSubmit={this.handleSubmit}>
        <InputField
          autoCapitalize="off"
          autoComplete="off"
          disabled={disabled}
          maxLength={63}
          onChange={this.onChange}
          onKeyDown={this.maybeBlur}
          placeholder="Add Agenda Topic…"
          innerRef={this.innerRef}
          type="text"
          value={value}
        />
        <StyledIcon>add_circle</StyledIcon>
      </InputForm>
    )
  }

  makeTooltip = () => (
    <div style={{textAlign: 'center'}}>
      {'Add meeting topics to discuss,'}
      <br />
      {'like “upcoming vacation”'}
    </div>
  )

  maybeBlur = (e) => {
    if (e.key === 'Escape' && this.inputRef) {
      this.inputRef.blur()
    }
  }

  maybeRefocus = () => {
    if (this.inputRef && this.refocusAfterUpdate) {
      this.inputRef.focus()
      this.refocusAfterUpdate = false
    }
  }

  maybeSaveFocus = () => {
    if (document.activeElement === this.inputRef) {
      this.refocusAfterUpdate = true
    }
  }

  render() {
    const {
      disabled,
      team: {agendaItems}
    } = this.props

    const form = this.makeForm()
    const showTooltip = Boolean(agendaItems.length > 0 && !disabled)
    return (
      <AgendaInputBlock>
        {showTooltip ? (
          <Tooltip
            delay={1000}
            hideOnFocus
            tip={this.makeTooltip()}
            maxHeight={52}
            maxWidth={224}
            originAnchor={{vertical: 'top', horizontal: 'center'}}
            targetAnchor={{vertical: 'bottom', horizontal: 'center'}}
          >
            {form}
          </Tooltip>
        ) : (
          form
        )}
      </AgendaInputBlock>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withHotkey(withMutationProps(AgendaInput))),
  graphql`
    fragment AgendaInput_team on Team {
      teamId: id
      agendaItems {
        sortOrder
      }
    }
  `
)
