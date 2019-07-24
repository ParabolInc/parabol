import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import MenuContents, {MenuContentsProps} from './MenuContents'

interface Props extends MenuContentsProps {
  error: Error
}

const ErrorBlock = styled(MenuContents)({
  padding: 16
})

const SmallPrint = styled('div')({
  marginTop: 16,
  fontSize: 10
})

const ModalError = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {error, ...blockProps} = props
  return (
    <ErrorBlock {...blockProps} ref={ref}>
      <DialogTitle>You found a bug!</DialogTitle>
      <DialogContent>
        {'We’ve alerted the developers. Try refreshing the page'}
        <SmallPrint>Error: {error.message}</SmallPrint>
      </DialogContent>
    </ErrorBlock>
  )
})

export default ModalError
