import styled from '@emotion/styled'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import {ExternalLinks} from '../types/constEnums'
import {CorsOptions} from '../types/cors'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  handleClick: () => void
  corsOptions: CorsOptions
}

const label = 'Export to CSV'

const Button = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const Label = styled('div')({
  color: PALETTE.SKY_400,
  fontSize: 14,
  fontWeight: 600
})

const Img = styled('img')({
  paddingRight: 8,
  filter: `sepia(100%) hue-rotate(195deg) saturate(1500%)` // make img blue
})

const ExportToCSVButton = (props: Props) => {
  const {handleClick, corsOptions} = props
  return (
    <Button onClick={handleClick}>
      <Img alt={label} src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`} {...corsOptions} />
      <Label>{label}</Label>
    </Button>
  )
}

export default ExportToCSVButton
