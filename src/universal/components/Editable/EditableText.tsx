import React, {Component} from 'react'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'

const StaticBlock = styled('div')({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
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
  fontSize: ICON_SIZE_FA_1X,
  lineHeight: 'inherit',
  marginLeft: '.5rem'
})

interface Props {
  error: string | undefined
  validate: (value: string) => boolean
  handleSubmit: (value: string) => void
  hideIcon?: boolean
  initialValue: string
  maxLength: number
  placeholder?: string
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

  setEditing = () => {
    this.setState({
      isEditing: true
    })
  }

  onChange = (e) => {
    const {validate} = this.props
    const {value: nextValue} = e.target
    const isValid = validate(nextValue)
    if (!isValid) return
    this.setState({
      value: nextValue
    })
  }

  onSubmit = async (e) => {
    e.preventDefault()
    this.setState({
      isEditing: false
    })
    const {handleSubmit, initialValue} = this.props
    const {value} = this.state
    if (value === initialValue) return
    handleSubmit(value)
  }

  renderEditing = () => {
    const {error, maxLength, placeholder} = this.props
    const {value} = this.state
    const formStyle = {
      display: 'flex'
    }
    const inputStyle = {
      backgroundColor: 'transparent',
      border: 0,
      display: 'block',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      outline: 'none',
      padding: 0,
      width: 'auto'
    }
    return (
      <form onSubmit={this.onSubmit} style={formStyle}>
        <input
          autoFocus
          maxLength={maxLength}
          onBlur={this.onSubmit}
          onChange={this.onChange}
          placeholder={placeholder}
          style={inputStyle}
          value={value}
        />
        {error && <Error>{error}</Error>}
      </form>
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
    return <div>{this.state.isEditing ? this.renderEditing() : this.renderStatic()}</div>
  }
}

// const styleThunk = (custom, {typeStyles}) => ({
//   editableRoot: {
//     display: 'block',
//     lineHeight: typeStyles.lineHeight,
//     width: '100%'
//   },
//
//   error: {
//     color: appTheme.palette.warm,
//     fontSize: '.85rem'
//   },
//
//   staticBlock: {
//     display: 'inline-block',
//     fontSize: 0,
//     lineHeight: typeStyles.lineHeight,
//     verticalAlign: 'top',
//
//     ':hover': {
//       cursor: 'pointer',
//       opacity: '.5'
//     }
//   },
//
//   static: {
//     color: typeStyles.color,
//     display: 'inline-block',
//     fontSize: typeStyles.fontSize,
//     lineHeight: typeStyles.lineHeight,
//     verticalAlign: 'middle'
//   },
//
//   placeholder: {
//     color: typeStyles.placeholderColor
//   },
//
//   icon: {
//     color: appTheme.palette.dark,
//     display: 'inline-block !important',
//     fontSize: `${ui.iconSize} !important`,
//     marginLeft: '.375rem',
//     verticalAlign: 'middle !important'
//   },
//
//   input: {
//     appearance: 'none',
//     backgroundColor: 'transparent',
//     border: 0,
//     borderRadius: 0,
//     display: 'inline-block',
//     fontFamily: 'inherit',
//     outline: 'none',
//     padding: 0,
//     verticalAlign: 'top',
//     width: '100%',
//
//     ...makePlaceholderStyles(typeStyles.placeholderColor)
//   }
// })

export default EditableText
