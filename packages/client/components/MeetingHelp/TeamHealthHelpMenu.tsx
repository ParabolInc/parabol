import graphql from 'babel-plugin-relay/macro'
import {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import {TeamHealthHelpMenu_stage$key} from '~/__generated__/TeamHealthHelpMenu_stage.graphql'
import useClientSideTrack from '../../hooks/useClientSideTrack'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'

interface Props {
  stageRef: TeamHealthHelpMenu_stage$key
}

const Intro = () => (
  <>
    <HelpMenuCopy>
      Start by encouraging your team members to vote if they haven't already. Not sure what to say?
      Try this:
    </HelpMenuCopy>
    <HelpMenuCopy>
      "Hi everyone! Let’s take a moment to share feedback about how we’re all feeling. The results
      will be anonymized when we reveal them.”
    </HelpMenuCopy>
  </>
)

const AllGood = () => (
  <>
    <HelpMenuCopy>
      Begin by expressing your gratitude for the positive feedback. You can say something like:
    </HelpMenuCopy>
    <HelpMenuCopy>
      "Splendid! It's wonderful to see such a positive response from all of you."
    </HelpMenuCopy>
    <HelpMenuCopy>
      Continue the conversation by asking what everyone’s recent highlight was or why they voted
      positively.
    </HelpMenuCopy>
  </>
)

const MostlyNeutral = () => (
  <>
    <HelpMenuCopy>
      Start by acknowledging the feedback and ask what we can learn from it. Try saying:
    </HelpMenuCopy>
    <HelpMenuCopy>
      "Thank you for sharing your feedback. It seems like we have a mix of neutral responses, and
      that's okay. Let's use this opportunity to dive deeper and explore the reasons for that during
      our meeting.”
    </HelpMenuCopy>
  </>
)

const MostlyNegative = () => (
  <>
    <HelpMenuCopy>
      Try thanking your team for their honesty and validate their feelings. Address concerns with
      empathy and provide a supportive environment for open discussion. You can start by saying:
    </HelpMenuCopy>
    <HelpMenuCopy>
      "I appreciate everyone's honesty, even when it's not all positive. Let’s discuss these
      feelings during our meeting.”
    </HelpMenuCopy>
  </>
)

const VeryMixed = () => (
  <>
    <HelpMenuCopy>
      Thank participants and acknowledge the diversity of opinions. Start the conversation by
      saying:
    </HelpMenuCopy>
    <HelpMenuCopy>
      "It's interesting to see such a range of responses. Each perspective is valuable. Let's
      discuss the reasons for these results in our meeting and identify any patterns or common
      themes that emerge.”
    </HelpMenuCopy>
  </>
)

const TeamHealthHelpMenu = forwardRef((props: Props, ref: any) => {
  const {stageRef} = props
  const {closePortal} = ref
  useClientSideTrack('Help Menu Open', {phase: 'TEAM_HEALTH'})

  const stage = useFragment(
    graphql`
      fragment TeamHealthHelpMenu_stage on TeamHealthStage {
        id
        votes
        isRevealed
      }
    `,
    stageRef
  )
  const {isRevealed, votes} = stage

  const Tip = (() => {
    if (!isRevealed || !votes) return Intro

    // for now we consider only 3 answers: good, neutral, bad
    if (votes.length !== 3) return null
    const good = votes[0]!
    const neutral = votes[1]!
    const bad = votes[2]!

    if (bad === 0 && good / neutral >= 2) return AllGood
    if (neutral / (good + bad) >= 2) return MostlyNeutral
    if (bad > good + neutral) return MostlyNegative
    return VeryMixed
  })()

  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup.TEAM_HEALTH}</HelpMenuHeader>
      {Tip && <Tip />}
    </HelpMenuContent>
  )
})

export default TeamHealthHelpMenu
