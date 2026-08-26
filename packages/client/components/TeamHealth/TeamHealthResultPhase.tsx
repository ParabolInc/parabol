import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultPhase_meeting$key} from '~/__generated__/TeamHealthResultPhase_meeting.graphql'
import {cn} from '../../ui/cn'
import {isNotNull} from '../../utils/predicates'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthCategoryTrend, {type CategoryTrendRow} from './TeamHealthCategoryTrend'
import TeamHealthResultCard from './TeamHealthResultCard'
import {HIDDEN_SPREAD_FOOTNOTE, MIN_SAFE_TEAM_HEALTH_RESPONSES} from './teamHealthAnonymity'

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
          meanScoreDelta
          respondentCount
          responseCount
          category {
            id
          }
        }
        team {
          # enough cycles to read a direction, few enough to stay legible in one row of bars
          teamHealthTrend(limit: 5) {
            meetingId
            name
            categoryScores {
              meanScore
              category {
                id
              }
            }
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
  const trendByCategoryId = new Map<string, {meetingId: string; name: string; score: number}[]>()
  meeting.team.teamHealthTrend.forEach((cycle) => {
    cycle.categoryScores.forEach(({category, meanScore}) => {
      const points = trendByCategoryId.get(category.id) ?? []
      points.push({meetingId: cycle.meetingId, name: cycle.name, score: meanScore})
      trendByCategoryId.set(category.id, points)
    })
  })
  // a single cycle is a reading, not a trend: with nothing behind it the whole section is noise
  const hasHistory = meeting.team.teamHealthTrend.length > 1
  const trendRows: CategoryTrendRow[] = !hasHistory
    ? []
    : results.flatMap((result) => {
        const categoryScore = scoreByCategoryId.get(result.categoryId)
        if (!categoryScore) return []
        return [
          {
            categoryId: result.categoryId,
            categoryName: result.category,
            meanScore: categoryScore.meanScore,
            meanScoreDelta: categoryScore.meanScoreDelta,
            points: trendByCategoryId.get(result.categoryId) ?? []
          }
        ]
      })
  const commented = results.filter((result) => result.comments.length > 0)
  const hasObscuredSpread = results.some((result) => {
    const responseCount = scoreByCategoryId.get(result.categoryId)?.responseCount ?? 0
    return responseCount > 0 && responseCount < MIN_SAFE_TEAM_HEALTH_RESPONSES
  })

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <div className='rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <h1 className='font-bold text-3xl text-fg-primary'>
          The reveal — here's what the team said
        </h1>
        <p className='mt-2 text-fg-muted'>
          Everyone's cards flipped together. Read the spread on each question, not just the average
          — a 3 made of fives and ones is a very different team from one that all answered three.
        </p>
      </div>
      <h2 className='mt-8 font-bold text-fg-primary text-xl'>What we asked this cycle</h2>
      <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
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
      {hasObscuredSpread && <p className='mt-4 text-fg-muted text-sm'>*{HIDDEN_SPREAD_FOOTNOTE}</p>}
      {trendRows.length > 0 && (
        <TeamHealthCategoryTrend
          className='mt-8'
          rows={trendRows}
          orderedCategoryIds={orderedCategoryIds}
        />
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
