import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import * as Toast from '@radix-ui/react-toast'
import {snackbarShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Radius, ZIndex} from '../types/constEnums'
import type {SnackAction} from './Snackbar'
import SnackbarMessageAction from './SnackbarMessageAction'

interface Props {
  message: string
  dismissSnack: () => void
  action?: SnackAction
  secondaryAction?: SnackAction
  showDismissButton?: boolean
}

const Text = styled('div')({
  color: '#FFFFFF',
  fontSize: 14,
  padding: '6px 8px'
})

const MessageStyles = styled('div')({
  alignItems: 'center',
  background: PALETTE.SLATE_700,
  borderRadius: Radius.SNACKBAR,
  boxShadow: snackbarShadow,
  display: 'flex',
  padding: 8,
  pointerEvents: 'auto',
  userSelect: 'none',
  zIndex: ZIndex.SNACKBAR
})

const DismissButton = styled('button')({
  border: 'none',
  backgroundColor: 'inherit',
  marginLeft: '8px',
  cursor: 'pointer',
  padding: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const StyledIcon = styled(Close)({
  color: PALETTE.SLATE_500,
  height: 18,
  width: 18,
  '&:hover': {
    opacity: 0.5
  }
})

const SnackbarMessage = (props: Props) => {
  const {action, secondaryAction, message, dismissSnack, showDismissButton} = props
  return (
    <div className='pb-2 print:hidden'>
      <MessageStyles onClick={dismissSnack}>
        <Toast.Description asChild>
          <Text>{message}</Text>
        </Toast.Description>
        <SnackbarMessageAction action={action} />
        <SnackbarMessageAction action={secondaryAction} />
        {showDismissButton && (
          <DismissButton
            onClick={(e) => {
              e.stopPropagation()
              dismissSnack()
            }}
          >
            <StyledIcon />
          </DismissButton>
        )}
      </MessageStyles>
    </div>
  )
}

export default SnackbarMessage
