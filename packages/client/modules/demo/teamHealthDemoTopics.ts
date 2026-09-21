import type {DemoTeammateKey} from './teamHealthDemoTeammates'

interface DemoThreadComment {
  author: DemoTeammateKey
  text: string
  reactjis?: {emoji: string; from: DemoTeammateKey[]}[]
  replies?: {author: DemoTeammateKey; text: string}[]
}

export interface DemoTopic {
  id: string
  name: string
  question: string
  description: string
  priorScores: [number, number, number, number]
  answers: [number, number, number, number, number, number]
  viewerAnswer: number
  viewerComment: string | null
  paraphrasedComments: {author: DemoTeammateKey | null; text: string}[]
  thread: DemoThreadComment[]
}

export const demoTopics: DemoTopic[] = [
  {
    id: 'psychologicalSafety',
    name: 'Psychological Safety',
    question: 'If I make a mistake on this team, it is not held against me.',
    description: 'Can people take risks and admit mistakes without fear of blame?',
    priorScores: [3.1, 3.3, 3.2, 3.6],
    answers: [4, 4, 4, 3, 4, 5],
    viewerAnswer: 4,
    viewerComment: 'The blameless write-up after the outage made it much easier to speak up.',
    paraphrasedComments: [
      {
        author: 'viewer',
        text: 'Blameless write-ups after incidents have made it easier to speak up.'
      },
      {author: null, text: 'Newer teammates still hesitate to disagree in planning.'}
    ],
    thread: [
      {
        author: 'priya',
        text: 'Up four checks running. The blameless write-ups seem to be landing.',
        reactjis: [{emoji: 'tada', from: ['noor', 'kwame', 'viewer']}],
        replies: [
          {author: 'kwame', text: 'Agreed. I would keep the same format for the next incident.'}
        ]
      },
      {
        author: 'ingrid',
        text: 'On planning: could we collect estimates silently before we discuss them?',
        reactjis: [{emoji: '+1', from: ['tomas', 'priya']}]
      }
    ]
  },
  {
    id: 'dependability',
    name: 'Dependability',
    question: "When my teammates say they'll do something, they follow through with it.",
    description: 'Do teammates reliably finish quality work on time?',
    priorScores: [4.2, 4.1, 4.3, 4.2],
    answers: [4, 4, 5, 4, 5, 4],
    viewerAnswer: 4,
    viewerComment: null,
    paraphrasedComments: [
      {author: 'noor', text: 'Handoffs between design and engineering have been smooth.'},
      {author: null, text: 'Review turnaround slips when two releases overlap.'}
    ],
    thread: [
      {
        author: 'noor',
        text: 'Steady and high. Nothing to fix, but worth saying out loud that this is working.',
        reactjis: [{emoji: 'heart', from: ['priya', 'ingrid']}]
      },
      {
        author: 'tomas',
        text: 'For overlapping releases, should we name a review buddy at kickoff?',
        replies: [{author: 'viewer', text: 'Yes please. Happy to pilot it on the next one.'}]
      }
    ]
  },
  {
    id: 'structureClarity',
    name: 'Structure & Clarity',
    question: "I know what's expected of me, and the goals for my work are clear.",
    description: 'Are roles, plans and goals clear to everyone on the team?',
    priorScores: [2.6, 2.9, 3.0, 3.4],
    answers: [4, 3, 4, 4, 3, 4],
    viewerAnswer: 4,
    viewerComment: 'Writing goals down at kickoff has helped a lot.',
    paraphrasedComments: [
      {author: 'viewer', text: 'Written goals at kickoff have made expectations clearer.'},
      {author: 'tomas', text: 'Priorities still shift mid-sprint without a heads-up.'}
    ],
    thread: [
      {
        author: 'tomas',
        text: 'A short note in the channel whenever priorities change would cover most of my concern.',
        reactjis: [{emoji: '+1', from: ['ingrid', 'noor', 'kwame']}],
        replies: [{author: 'priya', text: 'I can own that. Starting this sprint.'}]
      }
    ]
  },
  {
    id: 'meaning',
    name: 'Meaning',
    question: 'The work I do for our team is meaningful to me.',
    description: 'Do people find a sense of purpose in the work itself?',
    priorScores: [4.0, 3.8, 3.9, 3.9],
    answers: [4, 4, 4, 4, 5, 3],
    viewerAnswer: 5,
    viewerComment: null,
    paraphrasedComments: [
      {author: 'kwame', text: 'Hearing from customers directly keeps the work feeling worthwhile.'},
      {author: null, text: 'Maintenance weeks feel less connected to the bigger picture.'}
    ],
    thread: [
      {
        author: 'kwame',
        text: 'Could we open maintenance weeks with the customer problem behind each fix?',
        reactjis: [{emoji: 'bulb', from: ['viewer', 'priya']}]
      },
      {author: 'ingrid', text: 'I like that. I can pull the support tickets together.'}
    ]
  },
  {
    id: 'impact',
    name: 'Impact',
    question: "I can see the difference our team's work makes.",
    description: 'Does the team believe its work matters and creates change?',
    priorScores: [3.4, 3.3, 3.1, 3.0],
    answers: [3, 2, 3, 4, 2, 3],
    viewerAnswer: 3,
    viewerComment: "We ship a lot, but I rarely hear what happened after it's out.",
    paraphrasedComments: [
      {author: 'viewer', text: 'We ship often but rarely hear what changed afterwards.'},
      {author: 'ingrid', text: 'Usage numbers for our last two launches were never shared.'}
    ],
    thread: [
      {
        author: 'priya',
        text: 'This is the one to talk about: down for the fourth check in a row.',
        replies: [
          {author: 'noor', text: 'It matches what I hear in 1:1s. We never close the loop.'},
          {author: 'viewer', text: 'Even a rough adoption number a month after launch would help.'}
        ]
      },
      {
        author: 'ingrid',
        text: 'Proposal: a five-minute "what happened next" slot in every sprint review.',
        reactjis: [
          {emoji: '+1', from: ['viewer', 'tomas', 'kwame', 'noor']},
          {emoji: 'rocket', from: ['priya']}
        ]
      }
    ]
  }
]
