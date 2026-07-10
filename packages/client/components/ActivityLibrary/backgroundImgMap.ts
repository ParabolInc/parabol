import estimationBackgroundSrc from '../../../../static/images/illustrations/estimation-background.png'
import feedbackBackgroundSrc from '../../../../static/images/illustrations/feedback-background.png'
import postmortemBackgroundSrc from '../../../../static/images/illustrations/postmortem-background.png'
import premortemBackgroundSrc from '../../../../static/images/illustrations/premortem-background.png'
import retroBackgroundSrc from '../../../../static/images/illustrations/retro-background.png'
import standupBackgroundSrc from '../../../../static/images/illustrations/standup-background.png'
import teamHealthSrc from '../../../../static/images/illustrations/team-health-background.png'

export const backgroundImgMap = {
  retrospective: retroBackgroundSrc,
  standup: standupBackgroundSrc,
  feedback: feedbackBackgroundSrc,
  estimation: estimationBackgroundSrc,
  // no dedicated sky-toned strategy background yet; reuse the aqua standup art to match the theme
  strategy: standupBackgroundSrc,
  premortem: premortemBackgroundSrc,
  postmortem: postmortemBackgroundSrc,
  teamHealth: teamHealthSrc
} as const
