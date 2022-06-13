import styled from '@emotion/styled'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import {ExternalLinks} from '../types/constEnums'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  emailCSVUrl: string
  handleClick: any
}

const label = 'Export to CSV'

const iconLinkLabel = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '13px',
  paddingTop: 32
}

const imageStyle = {
  paddingRight: 8,
  verticalAlign: 'middle',
  color: 'blue'
}

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
  filter: `sepia(100%) hue-rotate(195deg) saturate(1500%)` // make img blue
})

const ExportToCSVButton = (props: Props) => {
  const {emailCSVUrl, handleClick} = props
  return (
    <Button>
      <Img
        crossOrigin=''
        alt={label}
        src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`}
        style={imageStyle}
        onClick={handleClick}
      />
      <Label>{label}</Label>
    </Button>
  )
}

export default ExportToCSVButton
