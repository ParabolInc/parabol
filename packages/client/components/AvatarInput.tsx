import {type ChangeEvent, type FormEvent, lazy, Suspense, useRef} from 'react'
import RaisedButton from './RaisedButton'
import StyledError from './StyledError'

interface Props {
  onSubmit: (file: File) => void
  error?: string
}

const Confetti = lazy(() => import(/* webpackChunkName: 'Confetti' */ './Confetti'))

const AvatarInput = (props: Props) => {
  const {error, onSubmit} = props
  const inputRef = useRef<HTMLInputElement>(null)

  const onClick = () => {
    inputRef.current?.click()
  }

  const onChange = (e: ChangeEvent<HTMLInputElement> | FormEvent<HTMLFormElement>) => {
    const {files} = e.currentTarget
    const imageToUpload = files ? files[0] : null
    if (!imageToUpload) return
    onSubmit(imageToUpload)
  }

  const isHack = error === 'xss'
  const errorStr = isHack ? 'You hacked us!' : error
  return (
    <div>
      <div className='relative flex justify-center overflow-hidden px-4 pt-2 pb-4'>
        <RaisedButton size='small' onClick={onClick} palette='gray' type='button'>
          {'Choose File'}
        </RaisedButton>
        <form onSubmit={onChange}>
          <input
            className='hidden'
            accept='image/*'
            onChange={onChange}
            type='file'
            ref={inputRef}
          />
        </form>
      </div>
      <Suspense fallback={''}>
        <Confetti active={isHack} />
      </Suspense>
      {error && <StyledError>{errorStr}</StyledError>}
    </div>
  )
}

export default AvatarInput
