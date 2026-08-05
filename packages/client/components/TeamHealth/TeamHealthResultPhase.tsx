import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultPhase_meeting$key} from '~/__generated__/TeamHealthResultPhase_meeting.graphql'
import {cn} from '../../ui/cn'
import {isNotNull} from '../../utils/predicates'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthDistributionChart from './TeamHealthDistributionChart'

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
  score: number | null
  distribution: number[]
  variance: number
  comments: string[]
}

// mean of a 1-5 Likert answer mapped onto a 0-100 scale, matching the design's headline numbers
const normalize = (mean: number) => Math.round(((mean - 1) / 4) * 100)

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
        score: null,
        distribution: [0, 0, 0, 0, 0],
        variance: 0,
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
  for (const entry of byQuestion.values()) {
    const {scores} = entry
    if (scores.length === 0) continue
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
    entry.score = normalize(mean)
    entry.variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length
  }
  return [...byQuestion.values()]
}

const badgeForScore = (score: number | null) => {
  if (score === null) return {label: 'No responses', className: 'bg-slate-200 text-slate-600'}
  if (score >= 70) return {label: 'Strong agreement', className: 'bg-jade-100 text-jade-700'}
  if (score >= 55) return {label: 'Aligned', className: 'bg-sky-100 text-sky-700'}
  return {label: 'Some concern', className: 'bg-gold-100 text-gold-700'}
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
  const results = computeResults(responses)
  const orderedCategoryIds = getOrderedTeamHealthCategories(
    meeting.template?.availableQuestionPacks ?? []
  ).map((category) => category.id)
  // the question with the widest spread is where the conversation is
  const divergent = results.reduce<QuestionResult | null>((widest, entry) => {
    if (entry.scores.length === 0) return widest
    if (!widest || entry.variance > widest.variance) return entry
    return widest
  }, null)

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <div className='rounded-2xl bg-white p-8 text-center shadow-sm'>
        <h1 className='font-bold text-3xl text-slate-900'>
          The reveal — here's what the team said
        </h1>
        <p className='mt-2 text-slate-500'>
          Everyone's cards flipped together. Talk through the spread — the divergence is where the
          conversation is.
        </p>
      </div>
      <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {results.map((result) => {
          const badge = badgeForScore(result.score)
          const isDivergent = divergent?.questionId === result.questionId
          return (
            <div
              key={result.questionId}
              className={cn(
                'rounded-2xl bg-white p-5 shadow-sm',
                isDivergent && 'ring-2 ring-grape-500'
              )}
            >
              <span
                className={cn(
                  'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-sm',
                  getTeamHealthCategoryColor(result.categoryId, orderedCategoryIds)
                )}
              >
                {result.category}
              </span>
              <div className='mt-4'>
                <TeamHealthDistributionChart distribution={result.distribution} />
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <span
                  className={cn('rounded-full px-2 py-0.5 font-semibold text-xs', badge.className)}
                >
                  {isDivergent ? 'Biggest divergence' : badge.label}
                </span>
                <span className='font-bold text-2xl text-slate-900'>{result.score ?? '—'}</span>
              </div>
            </div>
          )
        })}
      </div>
      {divergent && divergent.comments.length > 0 && (
        <div className='mt-8 rounded-2xl bg-white p-6 shadow-sm'>
          <div className='flex items-center gap-2 font-bold text-lg text-slate-900'>
            Let's talk:
            <span
              className={cn(
                'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-sm',
                getTeamHealthCategoryColor(divergent.categoryId, orderedCategoryIds)
              )}
            >
              {divergent.category}
            </span>
          </div>
          <p className='mt-1 text-slate-500 text-sm'>
            The widest split this cycle. Anonymous comments below.
          </p>
          <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {divergent.comments.map((comment, idx) => (
              <div key={idx} className='rounded-lg bg-slate-100 p-4 text-slate-700'>
                “{comment}”
              </div>
            ))}
          </div>
          <div className='mt-4 text-slate-400 text-xs'>Comments are never attributed to anyone</div>
        </div>
      )}
    </div>
  )
}

export default TeamHealthResultPhase
