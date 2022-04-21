import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {RETRO_TOPIC_LABEL} from 'parabol-client/utils/constants'
import plural from 'parabol-client/utils/plural'
import {RetroTopics_meeting} from 'parabol-client/__generated__/RetroTopics_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useEmailItemGrid from '../../../../../hooks/useEmailItemGrid'
import makeAppURL from '../../../../../utils/makeAppURL'
import AnchorIfEmail from './AnchorIfEmail'
import EmailBorderBottom from './EmailBorderBottom'
import EmailReflectionCard from './EmailReflectionCard'
import RetroTopic from './RetroTopic'

const sectionHeading = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
}

const stageThemeHeading = {
  color: PALETTE.SLATE_700,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none'
}

interface Props {
  isDemo: boolean
  isEmail: boolean
  appOrigin: string
  meeting: RetroTopics_meeting
}

const RetroTopics = (props: Props) => {
  const {isDemo, isEmail, appOrigin, meeting} = props
  const {id: meetingId, phases, reflectionGroups} = meeting
  const discussPhase = phases.find((phase) => phase.phaseType === 'discuss')
  if (!discussPhase || !discussPhase.stages) return null
  // filter out the dummy one when the meeting is first created
  const stages = discussPhase.stages.filter((stage) => stage.reflectionGroupId)

  const meetingPath = `/meet/${meetingId}`
  const meetingUrl = isEmail
    ? makeAppURL(appOrigin, meetingPath, {
        searchParams: {
          utm_source: 'summary email',
          utm_medium: 'email',
          utm_campaign: 'after-meeting'
        }
      })
    : meetingPath

  return (
    <>
      <tr>
        <td align='center' style={sectionHeading}>
          {plural(stages.length, RETRO_TOPIC_LABEL)}
        </td>
      </tr>
      {stages.length
        ? stages.map((stage, idx) => {
            const topicUrlPath = `/meet/${meetingId}/discuss/${idx + 1}`
            const topicUrl = isEmail
              ? makeAppURL(appOrigin, topicUrlPath, {
                  searchParams: {
                    utm_source: 'summary email',
                    utm_medium: 'email',
                    utm_campaign: 'after-meeting'
                  }
                })
              : topicUrlPath
            return (
              <RetroTopic
                key={stage.id}
                isDemo={isDemo}
                isEmail={isEmail}
                stage={stage}
                to={topicUrl}
              />
            )
          })
        : reflectionGroups.map((reflectionGroup) => {
            const {reflections, title} = reflectionGroup
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const grid = useEmailItemGrid(reflections, 3)
            return (
              <React.Fragment key={reflectionGroup.id}>
                <tr>
                  <td align='center' style={{paddingTop: 20}}>
                    <AnchorIfEmail
                      href={meetingUrl}
                      isDemo={isDemo}
                      isEmail={isEmail}
                      style={stageThemeHeading}
                    >
                      {title}
                    </AnchorIfEmail>
                  </td>
                </tr>
                <tr>
                  <td>
                    {grid((reflectionCard) => (
                      <EmailReflectionCard reflection={reflectionCard} />
                    ))}
                  </td>
                </tr>
              </React.Fragment>
            )
          })}
      <EmailBorderBottom />
    </>
  )
}

export default createFragmentContainer(RetroTopics, {
  meeting: graphql`
    fragment RetroTopics_meeting on RetrospectiveMeeting {
      id
      reflectionGroups(sortBy: voteCount) {
        id
        title
        reflections {
          ...EmailReflectionCard_reflection
        }
      }
      phases {
        phaseType
        ... on DiscussPhase {
          stages {
            id
            reflectionGroupId
            ...RetroTopic_stage
          }
        }
      }
    }
  `
})
