import emailDir from '../../../emailDir'
import React from 'react'
import {
  FONT_FAMILY,
  PALETTE_TEXT_MAIN
} from './constants'

interface Props {
  emailCSVUrl: string
}

const label = 'Export to CSV'

const iconLinkLabel = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: '13px',
  paddingTop: 32
}

const imageStyle = {
  paddingRight: 8,
  verticalAlign: 'middle'
}

const EmailExportCSVButton = (props: Props) => {
  const {emailCSVUrl} = props
  return (
    <tr>
      <td align='center' style={iconLinkLabel} width='100%'>
        <a href={emailCSVUrl} title={label}>
          <img alt={label} src={`${emailDir}cloud_download.png`} style={imageStyle} />
          {label}
        </a>
      </td>
    </tr>
  )
}

export default EmailExportCSVButton
