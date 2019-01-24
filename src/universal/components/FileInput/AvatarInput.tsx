import React, {Component} from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import StyledError from 'universal/components/StyledError'

const HiddenInput = styled('input')({
  display: 'none'
})

const Control = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '.5rem',
  position: 'relative'
})

interface Props {
  onSubmit: (file: File) => void
  error?: string
}

class AvatarInput extends Component<Props> {
  inputRef = React.createRef<HTMLInputElement>()
  onClick = () => {
    if (this.inputRef.current) {
      this.inputRef.current.click()
    }
  }
  onChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement>) => {
    const {onSubmit} = this.props
    const {files} = e.currentTarget
    const imageToUpload = files ? files[0] : null
    if (!imageToUpload) return
    // TODO see if we still need the setTimeout
    setTimeout(() => onSubmit(imageToUpload))
  }
  render () {
    const {error} = this.props
    return (
      <div>
        <Control>
          <RaisedButton size='small' onClick={this.onClick} palette='gray' type='button'>
            {'Choose File'}
          </RaisedButton>
          <form onSubmit={this.onChange}>
            <HiddenInput
              accept='image/*'
              onChange={this.onChange}
              type='file'
              innerRef={this.inputRef}
            />
          </form>
        </Control>
        {error && <StyledError>{error}</StyledError>}
      </div>
    )
  }
}

export default AvatarInput
