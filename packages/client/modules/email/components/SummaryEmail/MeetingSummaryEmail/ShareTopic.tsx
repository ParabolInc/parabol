import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import {useLocation} from 'react-router'
import AnchorIfEmail from './AnchorIfEmail'
import useRouter from '../../../../../hooks/useRouter'
import makeAppURL from '../../../../../utils/makeAppURL'

interface Props {
  isEmail: boolean
  isDemo: boolean
  meetingId: string
  stageId: string
  appOrigin: string
}

const label = 'Share Topic'

const style = {
  backgroundColor: PALETTE.WHITE,
  color: PALETTE.SKY_500,
  borderRadius: 64,
  border: `1px solid ${PALETTE.SKY_500}`,
  cursor: 'pointer',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 13,
  fontWeight: 600,
  padding: '7px 21px',
  textDecoration: 'none'
}

const ShareTopic = (props: Props) => {
  const {isDemo, isEmail, meetingId, stageId, appOrigin} = props
  const {history} = useRouter()
  const location = useLocation()

  const path = `new-summary/${meetingId}/share/${stageId}`

  const href = makeAppURL(appOrigin, path)

  if (isEmail || isDemo) {
    return (
      <AnchorIfEmail isEmail={true} isDemo={isDemo} href={href} style={style} title={label}>
        {label}
      </AnchorIfEmail>
    )
  }

  const onClick = () => {
    history.replace(`/${path}`, {
      backgroundLocation: location
    })
  }

  return (
    <span style={style} onClick={onClick}>
      {label}
    </span>
  )
}

export default ShareTopic
