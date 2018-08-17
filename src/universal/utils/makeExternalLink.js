import React from 'react'

const makeExternalLink = (copy, href) => (
  <a href={href} rel='noopener noreferrer' target='blank' title={copy}>
    {copy}
  </a>
)

export default makeExternalLink
