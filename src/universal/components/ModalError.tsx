import React, {forwardRef, Ref} from 'react'
import styled from 'react-emotion'
import DialogContent from 'universal/components/DialogContent'
import DialogTitle from 'universal/components/DialogTitle'
import MenuContents, {MenuContentsProps} from 'universal/components/MenuContents'

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
    <ErrorBlock {...blockProps} innerRef={ref}>
      <DialogTitle>You found a bug!</DialogTitle>
      <DialogContent>
        {'We’ve alerted the developers. Try refreshing the page'}
        <SmallPrint>Error: {error.message}</SmallPrint>
      </DialogContent>
    </ErrorBlock>
  )
})

export default ModalError
