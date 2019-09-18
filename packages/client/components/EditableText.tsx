import React, {Component} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import {PALETTE} from '../styles/paletteV2'
import appTheme from '../styles/theme/appTheme'
import Legitity from '../validation/Legitity'

const StaticBlock = styled('div')({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontFamily: appTheme.typography.sansSerif,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  width: '100%',
  ':hover': {
    opacity: 0.5
  }
})

const Placeholder = styled('div')({
  color: PALETTE.TEXT_GRAY
})

const StaticValue = styled('div')({
  color: PALETTE.TEXT_MAIN
})

const Error = styled('div')({
  color: PALETTE.ERROR_MAIN,
  fontSize: '.85rem'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  marginLeft: '.5rem'
})

const Input = styled('input')({
  backgroundColor: 'transparent',
  border: 0,
  color: PALETTE.TEXT_MAIN,
  display: 'block',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: 'none',
  padding: 0,
  width: 'auto'
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

interface Props {
  autoFocus?: boolean
  className?: string
  error: string | undefined
  validate: (value: string) => Legitity
  handleSubmit: (value: string) => void
  hideIcon?: boolean
  initialValue: string
  maxLength: number
  placeholder: string
  onEditingChange?: (isEditing: boolean) => void
}

interface State {
  autoFocus: boolean
  value: string
  isEditing: boolean
}

class EditableText extends Component<Props, State> {
  state = {
    autoFocus: false,
    isEditing: false,
    value: this.props.initialValue
  }

  inputRef = React.createRef<HTMLInputElement>()

  componentDidMount () {
    if (this.props.autoFocus) {
      this.setState({autoFocus: true})
    }
  }

  setEditing = (isEditing: boolean) => {
    const {onEditingChange} = this.props
    this.setState({
      isEditing
    })
    onEditingChange && onEditingChange(isEditing)
    this.setState({
      autoFocus: false
    })
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {validate} = this.props
    const nextValue = e.target.value || ''
    validate(nextValue)
    // make sure this is always true
    // repro: remove all text, blur input, focus input (with error present), then type a char
    this.setEditing(true)
    this.setState({
      value: nextValue
    })
  }

  onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const {value} = this.state
    const {placeholder} = this.props
    if (value.toLowerCase().startsWith(placeholder.toLowerCase())) {
      e.target.select()
    }
  }

  onSubmit = async (e: React.FocusEvent | React.FormEvent) => {
    e.preventDefault()
    this.setEditing(false)
    const {handleSubmit, initialValue} = this.props
    const {value} = this.state

    if (value.trim() === initialValue.trim()) return
    handleSubmit(value)
  }

  onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.reset()
    }
  }

  reset = () => {
    this.setEditing(false)
    this.setState(
      {
        value: this.props.initialValue
      },
      () => {
        this.props.validate(this.props.initialValue)
        this.inputRef.current && this.inputRef.current.blur()
      }
    )
  }
  renderEditing = () => {
    const {error, maxLength, placeholder} = this.props
    const {value} = this.state
    return (
      <Form onSubmit={this.onSubmit}>
        <Input
          autoFocus
          ref={this.inputRef}
          maxLength={maxLength}
          onBlur={this.onSubmit}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onKeyDown={this.onKeyDown}
          placeholder={placeholder}
          value={value}
        />
        {error && <Error>{error}</Error>}
      </Form>
    )
  }

  renderStatic = () => {
    const {hideIcon, placeholder} = this.props
    const value = this.state.value || this.props.initialValue
    const showPlaceholder = !value && placeholder
    return (
      <StaticBlock
        tabIndex={0}
        onFocus={() => this.setEditing(true)}
        onClick={() => this.setEditing(true)}
      >
        {showPlaceholder && <Placeholder>{placeholder}</Placeholder>}
        {value && <StaticValue>{value}</StaticValue>}
        {!hideIcon && <StyledIcon>edit</StyledIcon>}
      </StaticBlock>
    )
  }

  render () {
    const {className, error} = this.props
    const {autoFocus, isEditing} = this.state
    const showEditing = error || isEditing || autoFocus
    return (
      <div className={className}>{showEditing ? this.renderEditing() : this.renderStatic()}</div>
    )
  }
}

export default EditableText
