import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultPhase_meeting$key} from '~/__generated__/TeamHealthResultPhase_meeting.graphql'
import {cn} from '../../ui/cn'
import {isNotNull} from '../../utils/predicates'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthResultCard, {
  OBSCURE_SPREAD_BELOW,
  OBSCURED_SPREAD_EXPLANATION
} from './TeamHealthResultCard'

interface Props {
  meeting: TeamHealthResultPhase_meeting$key
  gotoStageId: (stageId: string) => void
}

interface QuestionResult {
  questionId: string
  question: string
  categoryId: string
  category: string
  scores: number[]
  distribution: number[]
  comments: string[]
}

const computeResults = (
  responses: readonly {
    score: number | null | undefined
    commentParaphrased: string | null | undefined
    question: {id: string; question: string; category: {id: string; name: string}}
  }[]
): QuestionResult[] => {
  const byQuestion = new Map<string, QuestionResult>()
  for (const response of responses) {
    const {question, score, commentParaphrased} = response
    let entry = byQuestion.get(question.id)
    if (!entry) {
      entry = {
        questionId: question.id,
        question: question.question,
        categoryId: question.category.id,
        category: question.category.name,
        scores: [],
        distribution: [0, 0, 0, 0, 0],
        comments: []
      }
      byQuestion.set(question.id, entry)
    }
    if (score != null && score >= 1 && score <= 5) {
      entry.scores.push(score)
      entry.distribution[score - 1]!++
    }
    if (commentParaphrased) entry.comments.push(commentParaphrased)
  }
  return [...byQuestion.values()]
}

const TeamHealthResultPhase = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthResultPhase_meeting on TeamHealthMeeting {
        template {
          availableQuestionPacks {
            questions {
              category {
                id
                name
                createdAt
              }
            }
          }
        }
        categoryScores {
          meanScore
          respondentCount
          responseCount
          category {
            id
          }
        }
        phases {
          phaseType
          stages {
            ... on TeamHealthResponseStage {
              stageIdx
              # aliased: NewMeetingStage.question is a String on the embedded TeamHealthStage, so
              # the raw key would conflict with this TeamHealthQuestion field
              healthQuestion: question {
                id
              }
            }
          }
        }
        responses {
          score
          commentParaphrased
          question {
            id
            question
            category {
              id
              name
            }
          }
        }
      }
    `,
    meetingRef
  )
  const responses = meeting.responses.filter(isNotNull)
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    meeting.template?.availableQuestionPacks ?? []
  ).map((category) => category.id)
  const scoreByCategoryId = new Map(
    meeting.categoryScores.map((categoryScore) => [categoryScore.category.id, categoryScore])
  )
  // cards read in the order the team was asked, which is the order they still have in mind
  const askOrderByQuestionId = new Map(
    meeting.phases
      .filter((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
      .flatMap((phase) => phase.stages)
      .flatMap((stage) =>
        stage.healthQuestion ? [[stage.healthQuestion.id, stage.stageIdx] as const] : []
      )
  )
  const results = computeResults(responses).sort(
    (a, b) =>
      (askOrderByQuestionId.get(a.questionId) ?? 0) - (askOrderByQuestionId.get(b.questionId) ?? 0)
  )
  const commented = results.filter((result) => result.comments.length > 0)
  const hasObscuredSpread = results.some((result) => {
    const responseCount = scoreByCategoryId.get(result.categoryId)?.responseCount ?? 0
    return responseCount > 0 && responseCount < OBSCURE_SPREAD_BELOW
  })

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <div className='rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <h1 className='font-bold text-3xl text-fg-primary'>
          The reveal — here's what the team said
        </h1>
        <p className='mt-2 text-fg-muted'>
          Everyone's cards flipped together. Read the spread on each question, not just the average
          — a 3.0 made of fives and ones is a very different team from one that all answered three.
        </p>
      </div>
      <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {results.map((result) => {
          const categoryScore = scoreByCategoryId.get(result.categoryId)
          return (
            <TeamHealthResultCard
              key={result.questionId}
              categoryId={result.categoryId}
              categoryName={result.category}
              question={result.question}
              // the server's rollup is what the summary page and the trend report, so the card
              // shows that rather than recomputing a number that only looks the same
              meanScore={categoryScore?.meanScore ?? null}
              distribution={result.distribution}
              respondentCount={categoryScore?.respondentCount ?? 0}
              responseCount={categoryScore?.responseCount ?? result.scores.length}
              orderedCategoryIds={orderedCategoryIds}
            />
          )
        })}
      </div>
      {hasObscuredSpread && (
        <p className='mt-4 text-fg-muted text-sm'>{OBSCURED_SPREAD_EXPLANATION}</p>
      )}
      {commented.length > 0 && (
        <div className='mt-8 rounded-2xl bg-surface-card p-6 shadow-card'>
          <h2 className='font-bold text-fg-primary text-lg'>What people wrote</h2>
          <p className='mt-1 text-fg-muted text-sm'>
            Every comment left this cycle, filed under the question it answers.
          </p>
          <div className='mt-4 flex flex-col gap-5'>
            {commented.map((result) => (
              <div key={result.questionId}>
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-sm',
                      getTeamHealthCategoryColor(result.categoryId, orderedCategoryIds)
                    )}
                  >
                    {result.category}
                  </span>
                  <span className='text-fg-secondary text-sm'>{result.question}</span>
                </div>
                <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {result.comments.map((comment, idx) => (
                    <div key={idx} className='rounded-lg bg-surface-well p-4 text-fg-primary'>
                      “{comment}”
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className='mt-4 text-fg-muted text-xs'>Comments are never attributed to anyone</div>
        </div>
      )}
    </div>
  )
}

export default TeamHealthResultPhase
