import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import {ExternalLinks} from '../../../../types/constEnums'

const label = 'Export to PDF'

const tdStyle: React.CSSProperties = {
  color: PALETTE.SLATE_700,
  fontSize: '13px',
  paddingTop: 32
}

const labelStyle: React.CSSProperties = {
  paddingLeft: 8
}
const imageStyle: React.CSSProperties = {
  verticalAlign: 'middle'
}

const linkStyle: React.CSSProperties = {
  height: '40px',
  padding: '12px 10px 0px 10px',
  cursor: 'pointer',
  width: 'fit-content'
}

function ExportToPDF() {
  const onClick = () => {
    window.print()
  }

  return (
    <>
      <tr className='hide-print'>
        <td align='center' style={tdStyle} width='100%'>
          <div onClick={onClick} style={linkStyle}>
            <img
              alt={label}
              src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`}
              style={imageStyle}
            />
            <span style={labelStyle}>{label}</span>
          </div>
        </td>
      </tr>
    </>
  )
}

export default ExportToPDF
