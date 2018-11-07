import React, {Component} from 'react'
import EmptySpace from 'universal/modules/email/components/EmptySpace/EmptySpace'

interface Props {
  emailCSVLUrl: string
}

const exportStyle = {
  margin: '16px auto 0'
}

const label = 'Export to CSV'
const iconSize = 24

const iconLinkIcon = {
  border: 0,
  display: 'inline-block',
  verticalAlign: 'middle'
}
const iconLinkLabel = {
  color: 'rgb(68, 66, 88)',
  display: 'inline-block',
  fontSize: '13px',
  height: `${iconSize}px`,
  lineHeight: `${iconSize}px`,
  margin: '0 0 0 12px',
  verticalAlign: 'middle'
}

class ExportToCSVEmail extends Component<Props> {
  render () {
    const {emailCSVLUrl} = this.props
    return (
      <React.Fragment>
        <EmptySpace height={16} />
        <a href={emailCSVLUrl} style={exportStyle} title={label}>
          <img
            style={iconLinkIcon}
            src='/static/images/icons/cloud_download.png'
            height={18}
            width={iconSize}
          />
          <span style={iconLinkLabel}>{label}</span>
        </a>
      </React.Fragment>
    )
  }
}

export default ExportToCSVEmail
