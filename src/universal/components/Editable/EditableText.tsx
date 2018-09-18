import React, {Component} from 'react'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'
import Legitity from '../../validation/Legitity'
import appTheme from 'universal/styles/theme/appTheme'

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
  color: PALETTE.TEXT.LIGHT
})

const StaticValue = styled('div')({
  color: PALETTE.TEXT.MAIN
})

const Error = styled('div')({
  color: PALETTE.ERROR.MAIN,
  fontSize: '.85rem'
})

const Icon = styled(StyledFontAwesome)({
  color: PALETTE.TEXT.LIGHT,
  fontSize: ICON_SIZE_FA_1X,
  lineHeight: 'inherit',
  marginLeft: '.5rem'
})

const Input = styled('input')({
  backgroundColor: 'transparent',
  border: 0,
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
  error: string | undefined
  validate: (value: string) => Legitity
  handleSubmit: (value: string) => void
  hideIcon?: boolean
  initialValue: string
  maxLength: number
  onError: (err?: string) => void
  placeholder: string
}

interface State {
  value: string
  isEditing: boolean
}

class EditableText extends Component<Props, State> {
  state = {
    isEditing: false,
    value: this.props.initialValue
  }

  inputRef = React.createRef<HTMLInputElement>()

  setEditing = () => {
    this.setState({
      isEditing: true
    })
  }

  onChange = (e) => {
    const {validate} = this.props
    const {value: nextValue} = e.target
    validate(nextValue)
    this.setState({
      // make sure this is always true
      // repro: remove all text, blur input, focus input (with error present), then type a char
      isEditing: true,
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
    this.setState({
      isEditing: false
    })
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
    this.setState(
      {
        value: this.props.initialValue,
        isEditing: false
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
          innerRef={this.inputRef}
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
      <StaticBlock onClick={this.setEditing}>
        {showPlaceholder && <Placeholder>{placeholder}</Placeholder>}
        {value && <StaticValue>{value}</StaticValue>}
        {!hideIcon && <Icon name={'pencil'} />}
      </StaticBlock>
    )
  }

  render () {
    const {error} = this.props
    const {isEditing} = this.state
    const showEditing = error || isEditing
    return <div>{showEditing ? this.renderEditing() : this.renderStatic()}</div>
  }
}

export default EditableText
