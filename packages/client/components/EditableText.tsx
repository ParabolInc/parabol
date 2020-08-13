import styled from '@emotion/styled'
import React, {Component} from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import {PALETTE} from '../styles/paletteV2'
import {FONT_FAMILY, ICON_SIZE} from '../styles/typographyV2'
import Legitity from '../validation/Legitity'
import Icon from './Icon'

const StaticBlock = styled('div')<{disabled: boolean | undefined}>(({disabled}) => ({
  alignItems: 'center',
  cursor: disabled ? 'default' : 'pointer',
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: disabled ? 'none' : undefined,
  width: '100%',
  ':hover': {
    opacity: disabled ? undefined : 0.5
  }
}))

const Placeholder = styled('div')({
  color: PALETTE.TEXT_GRAY
})

const StaticValue = styled('div')({
  color: PALETTE.TEXT_MAIN
})

const Error = styled('div')({
  color: PALETTE.ERROR_MAIN,
  fontSize: 14
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  marginLeft: 8
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

const TextArea = styled(TextAreaAutoSize)({
  backgroundColor: 'transparent',
  border: 0,
  color: PALETTE.TEXT_MAIN,
  display: 'block',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: 'none',
  padding: 0,
  resize: 'none',
  width: '100%'
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

interface Props {
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  error: string | undefined
  validate: (value: string) => Legitity
  handleSubmit: (value: string) => void
  hideIcon?: boolean
  isWrap?: boolean
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
  static getDerivedStateFromProps(
    nextProps: Readonly<Props>,
    prevState: State
  ): Partial<State> | null {
    const {initialValue} = nextProps
    if (prevState.isEditing || initialValue === prevState.value) return null
    return {value: initialValue}
  }

  state = {
    autoFocus: false,
    isEditing: false,
    value: this.props.initialValue
  }

  inputRef = React.createRef<HTMLInputElement | HTMLTextAreaElement>()

  componentDidMount() {
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

  onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {value} = this.state
    const {placeholder, isWrap} = this.props
    if (value.toLowerCase().startsWith(placeholder.toLowerCase())) {
      e.target.select()
    }
    if (isWrap) {
      // hack to move caret to end
      // because it's 2020 and we still have to do stupid hacks like this >:-(
      const tmp = e.target.value
      e.target.value = ''
      e.target.value = tmp
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
    const {error, maxLength, placeholder, isWrap} = this.props
    const {value} = this.state
    const inProps = {
      autoFocus: true,
      ref: this.inputRef,
      maxLength,
      onBlur: this.onSubmit,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onKeyDown: this.onKeyDown,
      placeholder,
      value
    } as any
    return (
      <Form onSubmit={this.onSubmit}>
        {isWrap ? <TextArea {...inProps} maxRows={3} /> : <Input {...inProps} />}
        {error && <Error>{error}</Error>}
      </Form>
    )
  }

  renderStatic = () => {
    const {disabled, hideIcon, placeholder} = this.props
    const value = this.state.value || this.props.initialValue
    const showPlaceholder = !value && placeholder
    return (
      <StaticBlock
        disabled={disabled}
        tabIndex={0}
        onFocus={() => this.setEditing(true)}
        onClick={() => this.setEditing(true)}
      >
        {showPlaceholder && <Placeholder>{placeholder}</Placeholder>}
        {value && <StaticValue>{value}</StaticValue>}
        {!hideIcon && !disabled && <StyledIcon>edit</StyledIcon>}
      </StaticBlock>
    )
  }

  render() {
    const {className, disabled, error} = this.props
    const {autoFocus, isEditing} = this.state
    const showEditing = (error || isEditing || autoFocus) && !disabled
    return (
      <div className={className}>{showEditing ? this.renderEditing() : this.renderStatic()}</div>
    )
  }
}

export default EditableText
