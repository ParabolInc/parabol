import React, {Component, lazy, Suspense} from 'react'
import styled from '@emotion/styled'
import RaisedButton from './RaisedButton'
import StyledError from './StyledError'

const HiddenInput = styled('input')({
  display: 'none'
})

const Control = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '1rem',
  position: 'relative'
})

interface Props {
  onSubmit: (file: File) => void
  error?: string
}

const Confetti = lazy(() => import(/* webpackChunkName: 'Confetti' */ './Confetti'))

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
    onSubmit(imageToUpload)
  }

  render() {
    const {error} = this.props
    const isHack = error === 'xss'
    const errorStr = isHack ? 'You hacked us!' : error
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
              ref={this.inputRef}
            />
          </form>
        </Control>
        <Suspense fallback={''}>
          <Confetti active={isHack} />
        </Suspense>
        {error && <StyledError>{errorStr}</StyledError>}
      </div>
    )
  }
}

export default AvatarInput
