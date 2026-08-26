import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultPhase_meeting$key} from '~/__generated__/TeamHealthResultPhase_meeting.graphql'
import {normalizeLikertMean} from '../../shared/teamHealth/normalizeLikertMean'
import {cn} from '../../ui/cn'
import {isNotNull} from '../../utils/predicates'
import {
  getOrderedTeamHealthCategories,
  getTeamHealthCategoryColor
} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import TeamHealthResultCard from './TeamHealthResultCard'

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
    entry.score = normalizeLikertMean(mean)
    entry.variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length
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
          normalizedScore
          respondentCount
          responseCount
          category {
            id
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
  // a cycle asks exactly one question per category, so ordering the cards by category is what makes
  // the grid stable from cycle to cycle even as rotation swaps the questions underneath it
  const results = computeResults(responses).sort(
    (a, b) => orderedCategoryIds.indexOf(a.categoryId) - orderedCategoryIds.indexOf(b.categoryId)
  )
  // the question with the widest spread is where the conversation is
  const divergent = results.reduce<QuestionResult | null>((widest, entry) => {
    if (entry.scores.length === 0) return widest
    if (!widest || entry.variance > widest.variance) return entry
    return widest
  }, null)

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <div className='rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <h1 className='font-bold text-3xl text-fg-primary'>
          The reveal — here's what the team said
        </h1>
        <p className='mt-2 text-fg-muted'>
          Everyone's cards flipped together. Talk through the spread — the divergence is where the
          conversation is.
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
              score={categoryScore?.normalizedScore ?? result.score}
              distribution={result.distribution}
              respondentCount={categoryScore?.respondentCount ?? 0}
              responseCount={categoryScore?.responseCount ?? result.scores.length}
              isDivergent={divergent?.questionId === result.questionId}
              orderedCategoryIds={orderedCategoryIds}
            />
          )
        })}
      </div>
      {divergent && divergent.comments.length > 0 && (
        <div className='mt-8 rounded-2xl bg-surface-card p-6 shadow-card'>
          <div className='flex items-center gap-2 font-bold text-fg-primary text-lg'>
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
          <p className='mt-1 text-fg-muted text-sm'>
            The widest split this cycle. Anonymous comments below.
          </p>
          <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {divergent.comments.map((comment, idx) => (
              <div key={idx} className='rounded-lg bg-surface-well p-4 text-fg-primary'>
                “{comment}”
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
