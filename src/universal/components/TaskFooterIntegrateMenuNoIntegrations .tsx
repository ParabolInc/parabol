import React from 'react'
import styled from 'react-emotion'
import Menu from 'universal/components/Menu'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  closePortal: () => void
  preferredName: string
}

const NarrowMenu = styled(Menu)({
  width: 200
})

const Label = styled('div')({
  color: PALETTE.TEXT.LIGHT,
  fontSize: 14,
  fontStyle: 'italic',
  padding: 8,
  textAlign: 'center'
})

const TaskFooterIntegrateMenuNoIntegrations = (props: Props) => {
  const {preferredName, closePortal} = props
  return (
    <NarrowMenu ariaLabel={'No providers available'} closePortal={closePortal}>
      <Label>{preferredName} does not have any integrations for this team.</Label>
    </NarrowMenu>
  )
}

export default TaskFooterIntegrateMenuNoIntegrations
