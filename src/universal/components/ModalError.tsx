import React from 'react'
import styled from 'react-emotion'
import DialogContent from 'universal/components/DialogContent'
import DialogTitle from 'universal/components/DialogTitle'
import MenuContents from 'universal/components/MenuContents'

interface Props {
  error: Error
}

const ErrorBlock = styled(MenuContents)({
  padding: 16
})

const SmallPrint = styled('div')({
  marginTop: 16,
  fontSize: 10
})

const ModalError = (props: Props) => {
  return (
    <ErrorBlock>
      <DialogTitle>You found a bug!</DialogTitle>
      <DialogContent>
        {'We’ve alerted the developers. Try refreshing the page'}
        <SmallPrint>Error: {props.error.message}</SmallPrint>
      </DialogContent>
    </ErrorBlock>
  )
}

export default ModalError
