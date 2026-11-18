import dayjs from 'dayjs'

export type RetroTeamHealthStatusState = 'everyoneIn' | 'collecting' | 'toGo' | 'answered'

interface Input {
  checkName: string
  scheduledEndTime: string | null | undefined
  isStartedHere: boolean
  isSpectating: boolean
  canReveal: boolean
  respondentTotal: number
  pendingCount: number
  questionCount: number
  answeredCount: number
}

const getRetroTeamHealthStatusCopy = (input: Input) => {
  const {checkName, scheduledEndTime, isStartedHere, isSpectating, canReveal} = input
  const {respondentTotal, pendingCount, questionCount, answeredCount} = input
  if (respondentTotal > 0 && pendingCount === 0) {
    return {
      state: 'everyoneIn' as const,
      title: "Everyone's answered",
      body: canReveal
        ? `All ${respondentTotal} teammates are in for ${checkName}. Nobody is left to wait on, so revealing now cuts no one off.`
        : `All ${respondentTotal} teammates are in for ${checkName}.`
    }
  }
  if (isSpectating) {
    return {
      state: 'collecting' as const,
      title: 'Your team is answering',
      body: 'As team lead you collect the answers and sit this one out, same as in the check.'
    }
  }
  const unansweredCount = questionCount - answeredCount
  if (unansweredCount > 0) {
    return {
      state: 'toGo' as const,
      title: unansweredCount === 1 ? 'One question to go' : `${unansweredCount} questions to go`,
      body: `You answered ${answeredCount} of ${questionCount}. Answer the rest so the results include your voice.`
    }
  }
  const closes = isStartedHere
    ? 'which closes when this retro ends'
    : scheduledEndTime
      ? `open until ${dayjs(scheduledEndTime).format('ddd, MMM D')} for teammates who haven't answered`
      : 'open until its results are revealed'
  return {
    state: 'answered' as const,
    title: 'Your answers are in',
    body: `They count toward ${checkName}, ${closes}.`
  }
}

export default getRetroTeamHealthStatusCopy
