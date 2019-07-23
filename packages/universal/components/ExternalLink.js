import React from 'react'

const ExternalLink = ({className, copy, href}) => (
  <a href={href} rel='noopener noreferrer' target='_blank' title={copy} className={className}>
    {copy}
  </a>
)

export default ExternalLink
