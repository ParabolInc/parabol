import React, {Fragment} from 'react'
import styled from '@emotion/styled'

import DialogTitle from './DialogTitle'

type DialogCopy = {
  title: string
  descriptionOne: string
  descriptionTwo: string
  actionButton: any
}

interface Props {
  dialogCopy: DialogCopy
}

const P = styled('p')({
  fontSize: 14,
  lineHeight: 1.5,
  margin: '16px 0',
  textAlign: 'center'
})

const Container = styled('div')({
  margin: '0 auto',
  maxWidth: 240,
  width: '100%'
})

const SubmittedForgotPasswordDialog = (props: Props) => {
  const {dialogCopy} = props

  return (
    <>
      <DialogTitle>{dialogCopy.title}</DialogTitle>
      <Container>
        <Fragment>
          <P>{dialogCopy.descriptionOne}</P>
          <P>{dialogCopy.descriptionTwo}</P>
          {dialogCopy.actionButton}
        </Fragment>
      </Container>
    </>
  )
}

export default SubmittedForgotPasswordDialog
