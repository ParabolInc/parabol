import {generateJSON} from '@tiptap/core'
import {serverTipTapExtensions} from '../../shared/tiptap/serverTipTapExtensions'

const taskLookup = {
  botRef1: [
    JSON.stringify(
      generateJSON(
        '<p>Create a process for making a collective decision, together</p>',
        serverTipTapExtensions
      )
    )
  ],
  botRef2: [
    JSON.stringify(generateJSON('<p>Document our testing process</p>', serverTipTapExtensions)),
    JSON.stringify(
      generateJSON(
        '<p>When onboarding new employees, have them document our processes as they learn them</p>',
        serverTipTapExtensions
      )
    )
  ],
  botRef3: [
    JSON.stringify(
      generateJSON('<p>Set a timer for speakers during meetings</p>', serverTipTapExtensions)
    )
  ],
  botRef4: [
    JSON.stringify(
      generateJSON(
        '<p>Propose which kind of decisions need to be made by the whole group</p>',
        serverTipTapExtensions
      )
    )
  ],
  botRef5: [
    JSON.stringify(
      generateJSON(
        '<p>Create a policy for when to decide in-person vs. when to decide over Slack, and who needs to be involved for each type</p>',
        serverTipTapExtensions
      )
    )
  ],
  botRef6: [
    JSON.stringify(generateJSON('<p>Try no-meeting Thursdays</p>', serverTipTapExtensions)),
    JSON.stringify(
      generateJSON(
        '<p>Use our planning meetings to discover which meetings and attendees to schedule</p>',
        serverTipTapExtensions
      )
    )
  ],
  botRef7: [
    JSON.stringify(
      generateJSON(
        '<p>Research reputable methods for prioritizing work that the team can review together</p>',
        serverTipTapExtensions
      )
    )
  ],
  botRef8: []
} as const

export default taskLookup
