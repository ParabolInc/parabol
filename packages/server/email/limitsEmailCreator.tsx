import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import LimitsEmail from '../../client/modules/email/components/LimitsEmail'
import emailTemplate from './emailTemplate'

interface Props {
  orgId: string
  preferredName: string
}

const limitsEmailCreator = (props: Props) => {
  const {preferredName, orgId} = props
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <LimitsEmail preferredName={preferredName} orgId={orgId} />
  )

  const subject = `Parabol Account - team limit reached`
  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.SLATE_200
  })

  return {
    subject,
    body: `Test`,
    html
  }
}

export default limitsEmailCreator
