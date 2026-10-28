import graphql from 'babel-plugin-relay/macro'
import {useEffect, useId, useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import {AutoAwesome} from '~/ui/icons'
import type {ReportAskBox_organization$key} from '../../__generated__/ReportAskBox_organization.graphql'
import useAskReportQuestionMutation from '../../mutations/useAskReportQuestionMutation'
import useLogReportQuestionUseMutation from '../../mutations/useLogReportQuestionUseMutation'
import {
  POPULAR_REPORT_QUESTIONS,
  type PopularReportQuestion
} from '../../shared/reports/popularReportQuestions'
import rankPopularReportQuestions from '../../shared/reports/rankPopularReportQuestions'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {Button} from '../../ui/Button/Button'
import ReportAskMenu from './ReportAskMenu'
import {type ReportAskOption, toReportAskOptions} from './reportAskOptions'
import {toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {parseReportSpecJSON} from './reportSpecParam'

graphql`
  fragment ReportAskBox_recentQuestion on ReportQuestion {
    id
    question
    title
    spec
    lastUsedAt
  }
`

interface Props {
  organizationRef: ReportAskBox_organization$key
  period: ReportPagePeriod
  onAskingChange: (question: string | null) => void
}

const ReportAskBox = ({organizationRef, period, onAskingChange}: Props) => {
  const {
    id: orgId,
    useAI,
    recentReportQuestions
  } = useFragment(
    graphql`
      fragment ReportAskBox_organization on Organization {
        id
        useAI
        recentReportQuestions {
          ...ReportAskBox_recentQuestion @relay(mask: false)
        }
      }
    `,
    organizationRef
  )
  const navigate = useNavigate()
  const listboxId = useId()
  const [ask, isAsking] = useAskReportQuestionMutation()
  const [logUse] = useLogReportQuestionUseMutation()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [answer, setAnswer] = useState<{
    reason: string
    suggestions: readonly PopularReportQuestion[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canAsk = useAI && !!window.__ACTION__.hasOpenAI
  const options = useMemo(
    () =>
      toReportAskOptions({
        query,
        recents: recentReportQuestions,
        populars: POPULAR_REPORT_QUESTIONS,
        suggestions: answer?.suggestions ?? null,
        canAsk
      }),
    [query, recentReportQuestions, answer, canAsk]
  )
  useEffect(() => {
    document.getElementById(`${listboxId}-${activeIndex}`)?.scrollIntoView({block: 'nearest'})
  }, [activeIndex, listboxId])

  const openReport = (spec: ReportSpec | null, title: string, reportQuestionId: string | null) => {
    if (!spec) return
    setIsOpen(false)
    navigate(toReportsHomePath(orgId, period, {spec, title, reportQuestionId}))
  }
  const askAI = (question: string) => {
    setError(null)
    setIsOpen(false)
    onAskingChange(question)
    const showError = (message: string) => {
      setError(message)
      setIsOpen(true)
    }
    ask({
      variables: {orgId, question, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone},
      onCompleted: (response, errors) => {
        onAskingChange(null)
        const payload = response.askReportQuestion
        if (errors?.[0] || !payload) {
          showError(errors?.[0]?.message ?? 'AI couldn’t answer just now. Try again in a moment')
          return
        }
        const {reportQuestion, reason} = payload
        const spec = reportQuestion.spec ? parseReportSpecJSON(reportQuestion.spec) : null
        if (spec) {
          openReport(spec, reportQuestion.title, reportQuestion.id)
          return
        }
        setAnswer({
          reason: reason ?? 'Parabol doesn’t have the data for that report',
          suggestions: rankPopularReportQuestions(question)
        })
        setActiveIndex(0)
        setIsOpen(true)
      },
      onError: (askError) => {
        onAskingChange(null)
        showError(askError.message)
      }
    })
  }
  const choose = (option: ReportAskOption) => {
    if (option.kind === 'ask') {
      askAI(option.question)
    } else if (option.kind === 'popular') {
      const {key, spec, title} = option.popular
      // the report opens once its recent question exists, so pinning it keeps what was picked
      logUse({
        variables: {orgId, popularQuestionKey: key},
        onCompleted: (response) =>
          openReport(spec, title, response.logReportQuestionUse?.reportQuestion.id ?? null),
        onError: () => openReport(spec, title, null)
      })
    } else if (option.recent.spec) {
      logUse({variables: {orgId, reportQuestionId: option.recent.id}})
      openReport(parseReportSpecJSON(option.recent.spec), option.recent.title, option.recent.id)
    } else {
      // a question AI couldn't answer goes back in the box to be reworded
      setQuery(option.recent.question ?? option.recent.title)
      setActiveIndex(0)
    }
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => Math.min(options.length - 1, Math.max(0, index + step)))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = options[activeIndex]
      if (option && !isAsking) choose(option)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }
  const notice =
    error ??
    (answer &&
      `Parabol can’t make that report: ${answer.reason} These popular questions are nearest.`)
  const question = query.trim()
  return (
    <div className='relative'>
      <div className='flex min-h-11 items-center gap-2.5 rounded-lg border border-hairline-field bg-surface-input pr-1.5 pl-3 focus-within:border-accent'>
        <AutoAwesome className='shrink-0 text-[18px] text-sky-600 dark:text-accent' />
        <input
          role='combobox'
          aria-label={
            canAsk ? 'Ask a question about your organization' : 'Search popular questions'
          }
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-autocomplete='list'
          aria-activedescendant={
            isOpen && options[activeIndex] ? `${listboxId}-${activeIndex}` : undefined
          }
          value={query}
          placeholder={
            canAsk ? 'Ask a question, or pick a popular one' : 'Search popular questions'
          }
          className='h-10 min-w-0 flex-1 bg-transparent text-base text-fg-primary outline-none placeholder:text-fg-muted'
          onChange={(event) => {
            setQuery(event.target.value)
            setAnswer(null)
            setError(null)
            setActiveIndex(0)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={onKeyDown}
        />
        {canAsk && (
          <Button
            variant='dialogPrimary'
            size='sm'
            className='h-8'
            disabled={!question || isAsking}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => askAI(question)}
          >
            Ask
          </Button>
        )}
      </div>
      {isOpen && (
        <ReportAskMenu
          listboxId={listboxId}
          options={options}
          activeIndex={activeIndex}
          canAsk={canAsk}
          notice={notice}
          onChoose={choose}
          onHover={setActiveIndex}
        />
      )}
    </div>
  )
}

export default ReportAskBox
