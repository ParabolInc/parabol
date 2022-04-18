import withAtmosphere, {WithAtmosphereProps} from 'parabol-client/decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import withMutationProps, {WithMutationProps} from 'parabol-client/utils/relay/withMutationProps'
import React, {Component} from 'react'
import {ExternalLinks} from '../../../../types/constEnums'

interface Props extends WithAtmosphereProps, WithMutationProps {}

const label = 'Export to PDF'

const tdStyle = {
  color: PALETTE.SLATE_700,
  fontSize: '13px',
  paddingTop: 32,
}

const labelStyle = {
  paddingLeft: 8
}
const imageStyle = {
  verticalAlign: 'middle'
}

const linkStyle = {
  height: '40px',
  padding: '12px 10px 0px 10px',
  cursor: 'pointer',
  width: 'fit-content',
}

class ExportToPDF extends Component<Props> {

  onClick() {
    window.print()
  }

  render() {
    return (
      <>
        <tr className="hide-print" >
          <td align='center' style={tdStyle} width='100%'>
            <div onClick={this.onClick} style={linkStyle}>
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
}

export default withAtmosphere(withMutationProps(ExportToPDF))
