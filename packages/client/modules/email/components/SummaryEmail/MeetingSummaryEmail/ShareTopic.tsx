import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import ShareTopicRoot from '../../../../../components/ShareTopicRoot'
import {useDialogState} from '../../../../../ui/Dialog/useDialogState'
import makeAppURL from '../../../../../utils/makeAppURL'
import AnchorIfEmail from './AnchorIfEmail'

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

  const path = `new-summary/${meetingId}/share/${stageId}`
  const href = makeAppURL(appOrigin, path, {
    searchParams: {
      utm_source: 'summary email',
      utm_medium: 'email',
      utm_campaign: 'sharing'
    }
  })

  if (isEmail) {
    return (
      <AnchorIfEmail isEmail={true} href={href} style={style} title={label}>
        {label}
      </AnchorIfEmail>
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {isOpen, open, close} = useDialogState()

  const onClick = () => {
    if (isDemo) return
    open()
  }

  return (
    <>
      <span style={style} onClick={onClick}>
        {label}
      </span>

      {isOpen && <ShareTopicRoot onClose={close} stageId={stageId} meetingId={meetingId} />}
    </>
  )
}

export default ShareTopic
