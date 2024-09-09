import estimationBackgroundSrc from '../../../../static/images/illustrations/estimation-background.png'
import feedbackBackgroundSrc from '../../../../static/images/illustrations/feedback-background.png'
import postmortemBackgroundSrc from '../../../../static/images/illustrations/postmortem-background.png'
import premortemBackgroundSrc from '../../../../static/images/illustrations/premortem-background.png'
import retroBackgroundSrc from '../../../../static/images/illustrations/retro-background.png'
import standupBackgroundSrc from '../../../../static/images/illustrations/standup-background.png'
import strategyBackgroundSrc from '../../../../static/images/illustrations/strategy-background.png'

export const backgroundImgMap = {
  retrospective: retroBackgroundSrc,
  standup: standupBackgroundSrc,
  feedback: feedbackBackgroundSrc,
  estimation: estimationBackgroundSrc,
  strategy: strategyBackgroundSrc,
  premortem: premortemBackgroundSrc,
  postmortem: postmortemBackgroundSrc
} as const
