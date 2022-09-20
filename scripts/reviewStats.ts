const ms = require('ms')

const GITHUB_ENDPOINT = 'https://api.github.com/graphql'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const TIME_DIFF = process.env.TIME_DIFF || '7d'
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK
const REPO = process.env.REPO

const query = `
query($searchQuery: String!) { 
  search(query: $searchQuery, type: ISSUE, first: 100) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
        ... on PullRequest {
          number
          url
          publishedAt
          mergedAt
          author { ...UserFragment }
          timelineItems(first: 100) {
              nodes {
                __typename
                ... on ReviewRequestedEvent {
                  createdAt
                  requestedReviewer { ...UserFragment }
                }
                ... on PullRequestReview {
                id
                author { ...UserFragment }
                comments(first: 1) {
                  totalCount
                }
                submittedAt
                state
            }
          }
        }
      }
    }
  }
}
fragment UserFragment on User {
  url
  login
  avatarUrl
}
`

const fetchData = async (mergedAfter: Date) => {
  const fetch = require('node-fetch')
  const searchQuery = `is:pr archived:false is:closed is:merged repo:${REPO} merged:>=${mergedAfter.toISOString()}`
  const response = await fetch(GITHUB_ENDPOINT, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'Authorization': `bearer ${GITHUB_TOKEN}`
    },
    body: JSON.stringify({
      query,
      variables: {
        searchQuery
      }
    })
  })

  console.log(`Pulling stats for ${REPO}: ${response.status}`)

  //TODO we're not checking pagination yet
   
  return response.json()
}

const pushToSlack = async (body: any) => {
  const fetch = require('node-fetch')
  const response = await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify(body)
  })

  console.log(`Pushing stats: ${response.status}`)
}

const median = (values: number[]) => {
  if(values.length === 0) return '-'

  values.sort()
  var middle = Math.floor(values.length / 2)
  if (values.length % 2) return values[middle]
  return (values[middle- 1] + values[middle]) / 2.0;
}

const parseStats = (rawData: any) => {
  const reviewerStats = {} as any

  const prs = rawData.data.search.nodes.map((pr: any) => {
    const publishedAt = new Date(pr.publishedAt)
    const mergedAt = new Date(pr.mergedAt)
    const timeToMerge = mergedAt.valueOf() - publishedAt.valueOf()

    const requestedReviewers = {} as Record<string, Date | undefined>
    const reviewers = new Set<string>() 
    let comments = 0
    let reviews = 0
    pr.timelineItems.nodes.forEach((item: any) => {
      if (item.__typename === 'ReviewRequestedEvent') {
        requestedReviewers[item.requestedReviewer.login] = new Date(item.createdAt)
      }
      if (item.__typename === 'PullRequestReview') {
        const login = item.author.login

        if (!reviewerStats[login]) {
          reviewerStats[login] = {
            ...item.author,
            timesToReview: [],
            reviewStates: [],
            comments: 0,
            reviewedPRs: 0,
          }
        }
        reviewerStats[login].reviewStates.push(item.state)
        reviewerStats[login].comments += item.comments.totalCount

        const request = requestedReviewers[login]
        if (request) {
          const timeToReview = (new Date(item.submittedAt)).valueOf() - request.valueOf()
          reviewerStats[login].timesToReview.push(timeToReview)
          requestedReviewers[login] = undefined
        }

        reviewers.add(login)
        comments += item.comments.totalCount
        reviews++
      }
    })
    reviewers.forEach(reviewer => {
      reviewerStats[reviewer].reviewedPRs++
    })

    return {
      number: pr.number,
      author: pr.author,
      timeToMerge: timeToMerge,
      comments,
      reviews,
    }
  })

  return {
    reviewerStats,
    prs
  }
}

const padRight = (str: string, width: number) => {
  const length = Math.min(str.length, width)
  return str.slice(0, length) + ' '.repeat(width - length)
}

const formatRow = (values: (string|number)[], format: number[]) => {
  const rows = [] as string[]

  do {
    const row = [] as string[]

    const overflow = Array(values.length).fill('')
    values.forEach((value, index) => {
      const valueStr = value.toString()
      const fieldLength = format[Math.min(index, format.length - 1)]
      row.push(padRight(valueStr, fieldLength))
      if (valueStr.length > fieldLength) {
        overflow[index] = valueStr.slice(fieldLength)
      }
    })
    values = overflow

    rows.push(row.join(' | '))
  } while(values.find(value => !!value))

  return rows.join('\n')
}

const safeMs = (val: number | '-' | undefined | null) => typeof val === 'number' && isFinite(val) ? ms(val) : '-'

const formatReviewers = (reviewerStats) => {
  const format = [15, 8]
  const rows = [] as string[]
  rows.push(formatRow(['login', 'median time to review', 'reviewed PRs', 'comments', 'approvals', 'changes requested'], format))
  Object.values(reviewerStats).forEach((reviewer: any) => {
    const {login, timesToReview, reviewedPRs, reviewStates, comments} = reviewer
    const medianTimeToReview = safeMs(median(timesToReview))
    const approvals = reviewStates.filter(state => state === 'APPROVED').length
    const changesRequested = reviewStates.filter(state => state === 'CHANGES_REQUESTED').length
    rows.push(formatRow([login, medianTimeToReview, reviewedPRs, comments, approvals, changesRequested], format))
  })
  return rows.join('\n')
}

const formatPrs = (prs) => {
  const format = [20, 6]
  const rows = [] as string[]
  rows.push(formatRow(['', 'min', 'max', 'median'], format))

  const timesToMerge = prs.map(({timeToMerge}: {timeToMerge: number}) => timeToMerge)
  rows.push(formatRow(['time to merge', safeMs(Math.min(...timesToMerge)), safeMs(Math.max(...timesToMerge)), safeMs(median(timesToMerge))], format))

  const comments = prs.map(({comments}) => comments)
  rows.push(formatRow(['comments per PR', Math.min(...comments), Math.max(...comments), median(comments)], format))

  const reviews = prs.map(({reviews}) => reviews)
  rows.push(formatRow(['reviews per PR', Math.min(...reviews), Math.max(...reviews), median(reviews)], format))

  return rows.join('\n')
}

const main = async () => {
  const now = new Date()
  const mergedSince = new Date(now.valueOf() - ms(TIME_DIFF))

  const rawData = await fetchData(mergedSince)
  const {reviewerStats, prs} = parseStats(rawData)

  console.log(`Stats for last ${TIME_DIFF}`)
  console.log('Reviewer stats')
  console.log(formatReviewers(reviewerStats))
  console.log('PR stats')
  console.log(`Total ${prs.length} PRs merged`)
  console.log(formatPrs(prs))


  const slackMessage = {
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Review stats for last ${TIME_DIFF}*\nTotal ${prs.length} PRs merged`
      },
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Reviewer stats'
      },
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '```\n' + formatReviewers(reviewerStats) + '\n```'
      },
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'PR stats'
      },
    }, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '```\n' + formatPrs(prs) + '\n```'
      },
    }]
  }

  pushToSlack(slackMessage)
}

main()

