import styled from '@emotion/styled'
import {Chat} from '@mui/icons-material'
import {PALETTE} from '../styles/paletteV3'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import PrimaryButton from './PrimaryButton'

const StyledCopy = styled('p')({
  fontSize: 16,
  lineHeight: 1.5,
  margin: '16px 0 24px',
  padding: 0,
  textAlign: 'center'
})

const StyledIcon = styled(Chat)({
  color: PALETTE.SKY_500,
  width: 48,
  height: 48
})

interface Props {
  isOpen: boolean
  startDemo: () => void
}

const BeginDemoModal = (props: Props) => {
  const {isOpen, startDemo} = props

  return (
    <Dialog isOpen={isOpen}>
      <DialogContent noClose>
        <div className='flex flex-col items-center px-4 pb-8'>
          <StyledIcon />
          <StyledCopy>
            Try Parabol for yourself by holding a 2-minute retrospective meeting with our simulated
            colleagues
          </StyledCopy>
          <PrimaryButton dataCy='start-demo-button' onClick={startDemo} size='medium'>
            Start Demo
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BeginDemoModal
