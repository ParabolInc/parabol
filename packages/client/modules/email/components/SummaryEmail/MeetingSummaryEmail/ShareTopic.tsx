import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React, {Suspense} from 'react'
import AnchorIfEmail from './AnchorIfEmail'
import makeAppURL from '../../../../../utils/makeAppURL'
import {renderLoader} from '../../../../../utils/relay/renderLoader'
import ShareTopicModal from '../../../../../components/ShareTopicModal'
import {useDialogState} from '../../../../../ui/Dialog/useDialogState'
import useQueryLoaderNow from '../../../../../hooks/useQueryLoaderNow'
import shareTopicModalQuery, {
  ShareTopicModalQuery
} from '../../../../../__generated__/ShareTopicModalQuery.graphql'

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
  const href = makeAppURL(appOrigin, path)

  if (isEmail) {
    return (
      <AnchorIfEmail isEmail={true} href={href} style={style} title={label}>
        {label}
      </AnchorIfEmail>
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {isOpen, open, close} = useDialogState()

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const queryRef = useQueryLoaderNow<ShareTopicModalQuery>(
    shareTopicModalQuery,
    {meetingId},
    'network-only'
  )

  const onClick = () => {
    if (isDemo) return
    open()
  }

  return (
    <>
      <span style={style} onClick={onClick}>
        {label}
      </span>
      <Suspense fallback={renderLoader()}>
        {queryRef && (
          <ShareTopicModal
            stageId={stageId}
            meetingId={meetingId}
            isOpen={isOpen}
            onClose={close}
            queryRef={queryRef}
          />
        )}
      </Suspense>
    </>
  )
}

export default ShareTopic
