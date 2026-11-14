import type {Kysely} from 'kysely'

const SEED_DATE = new Date('2026-10-06T00:00:00.000Z')
const ILLUSTRATION_URL_PREFIX = '/assets/Organization/aGhostOrg/template/'
const TOMATO_500 = '#FD6157'
const TERRA_300 = '#FE975D'
const GOLD_300 = '#FFCC63'
const JADE_400 = '#66BC8C'
const AQUA_400 = '#55C0CF'
const SKY_500 = '#329AE5'
const LILAC_500 = '#7272E5'

const TEMPLATES = [
  {
    id: 'learningMatrixTemplate',
    name: 'Learning Matrix',
    illustration: 'learningMatrixTemplate.png',
    mainCategory: 'retrospective',
    prompts: [
      {
        id: 'learningMatrixTemplate:wentWellPrompt',
        question: 'Went Well',
        description: 'What did we do well that we want to keep doing?',
        groupColor: JADE_400,
        sortOrder: '!'
      },
      {
        id: 'learningMatrixTemplate:toChangePrompt',
        question: 'To Change',
        description: 'What would we do differently next time?',
        groupColor: TOMATO_500,
        sortOrder: '"'
      },
      {
        id: 'learningMatrixTemplate:newIdeasPrompt',
        question: 'New Ideas',
        description: 'What new ideas or experiments should we try?',
        groupColor: GOLD_300,
        sortOrder: '#'
      },
      {
        id: 'learningMatrixTemplate:appreciationsPrompt',
        question: 'Appreciations',
        description: 'Who do you want to thank, and what for?',
        groupColor: AQUA_400,
        sortOrder: '$'
      }
    ]
  },
  {
    id: 'wentWellNotWellImproveTemplate',
    name: 'Went Well, Not Well, Improve',
    illustration: 'wentWellNotWellImproveTemplate.png',
    mainCategory: 'retrospective',
    prompts: [
      {
        id: 'wentWellNotWellImproveTemplate:wentWellPrompt',
        question: 'Went Well',
        description: 'What worked and is worth repeating?',
        groupColor: JADE_400,
        sortOrder: '!'
      },
      {
        id: 'wentWellNotWellImproveTemplate:didntGoWellPrompt',
        question: "Didn't Go Well",
        description: 'What got in our way or fell short of what we hoped for?',
        groupColor: TOMATO_500,
        sortOrder: '"'
      },
      {
        id: 'wentWellNotWellImproveTemplate:toImprovePrompt',
        question: 'To Improve',
        description: 'What should we change or try so that next time goes better?',
        groupColor: SKY_500,
        sortOrder: '#'
      }
    ]
  },
  {
    id: 'startStopContinueKudosTemplate',
    name: 'Start, Stop, Continue, Kudos',
    illustration: 'startStopContinueKudosTemplate.png',
    mainCategory: 'retrospective',
    prompts: [
      {
        id: 'startStopContinueKudosTemplate:startPrompt',
        question: 'Start',
        description: 'What new behaviors should we adopt?',
        groupColor: JADE_400,
        sortOrder: '!'
      },
      {
        id: 'startStopContinueKudosTemplate:stopPrompt',
        question: 'Stop',
        description: 'What existing behaviors should we cease doing?',
        groupColor: TOMATO_500,
        sortOrder: '"'
      },
      {
        id: 'startStopContinueKudosTemplate:continuePrompt',
        question: 'Continue',
        description: 'What current behaviors should we keep doing?',
        groupColor: GOLD_300,
        sortOrder: '#'
      },
      {
        id: 'startStopContinueKudosTemplate:kudosPrompt',
        question: 'Kudos',
        description: 'Share the love! Give a shoutout to someone who did great work!',
        groupColor: AQUA_400,
        sortOrder: '$'
      }
    ]
  },
  {
    id: 'theGoodTheBadTheUglyTemplate',
    name: 'The Good, the Bad & the Ugly',
    illustration: 'goodBadUglyTemplate.png',
    mainCategory: 'retrospective',
    prompts: [
      {
        id: 'theGoodTheBadTheUglyTemplate:theGoodPrompt',
        question: 'The Good',
        description: 'What went well and deserves to be celebrated?',
        groupColor: JADE_400,
        sortOrder: '!'
      },
      {
        id: 'theGoodTheBadTheUglyTemplate:theBadPrompt',
        question: 'The Bad',
        description: "What didn't go well, but we can live with or fix easily?",
        groupColor: TERRA_300,
        sortOrder: '"'
      },
      {
        id: 'theGoodTheBadTheUglyTemplate:theUglyPrompt',
        question: 'The Ugly',
        description: 'What went badly enough that it must not happen again?',
        groupColor: TOMATO_500,
        sortOrder: '#'
      }
    ]
  },
  {
    id: 'keepAddLessMoreKALMTemplate',
    name: 'Keep, Add, Less, More (KALM)',
    illustration: 'kalmTemplate.png',
    mainCategory: 'retrospective',
    prompts: [
      {
        id: 'keepAddLessMoreKALMTemplate:keepPrompt',
        question: 'Keep',
        description: 'What is working well that we should keep exactly as it is?',
        groupColor: GOLD_300,
        sortOrder: '!'
      },
      {
        id: 'keepAddLessMoreKALMTemplate:addPrompt',
        question: 'Add',
        description: 'What new idea or practice should we bring in?',
        groupColor: JADE_400,
        sortOrder: '"'
      },
      {
        id: 'keepAddLessMoreKALMTemplate:lessPrompt',
        question: 'Less',
        description: 'What are we doing that we should dial down?',
        groupColor: TERRA_300,
        sortOrder: '#'
      },
      {
        id: 'keepAddLessMoreKALMTemplate:morePrompt',
        question: 'More',
        description: 'What is valuable that we should do more often?',
        groupColor: SKY_500,
        sortOrder: '$'
      }
    ]
  },
  {
    id: 'flapTemplate',
    name: 'FLAP',
    illustration: 'flapTemplate.png',
    mainCategory: 'postmortem',
    prompts: [
      {
        id: 'flapTemplate:futureConsiderationsPrompt',
        question: 'Future Considerations',
        description: 'What should we keep in mind or plan for going forward?',
        groupColor: SKY_500,
        sortOrder: '!'
      },
      {
        id: 'flapTemplate:lessonsLearnedPrompt',
        question: 'Lessons Learned',
        description: 'What did we learn that we should carry into future work?',
        groupColor: LILAC_500,
        sortOrder: '"'
      },
      {
        id: 'flapTemplate:accomplishmentsPrompt',
        question: 'Accomplishments',
        description: 'What did we achieve that we are proud of?',
        groupColor: JADE_400,
        sortOrder: '#'
      },
      {
        id: 'flapTemplate:problemAreasPrompt',
        question: 'Problem Areas',
        description: 'Where did we struggle, and what needs attention?',
        groupColor: TOMATO_500,
        sortOrder: '$'
      }
    ]
  }
]

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('MeetingTemplate')
    .values(
      TEMPLATES.map(({id, name, illustration, mainCategory}) => ({
        id,
        name,
        mainCategory,
        type: 'retrospective',
        teamId: 'aGhostTeam',
        orgId: 'aGhostOrg',
        scope: 'PUBLIC',
        isActive: true,
        isStarter: true,
        isFree: true,
        illustrationUrl: `${ILLUSTRATION_URL_PREFIX}${illustration}`,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }))
    )
    .onConflict((oc) => oc.doNothing())
    .execute()

  await db
    .insertInto('TemplatePrompt')
    .values(
      TEMPLATES.flatMap(({id: templateId, prompts}) =>
        prompts.map((prompt) => ({
          ...prompt,
          templateId,
          teamId: 'aGhostTeam',
          parentPromptId: null,
          removedAt: null,
          createdAt: SEED_DATE,
          updatedAt: SEED_DATE
        }))
      )
    )
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('TemplatePrompt')
    .where(
      'id',
      'in',
      TEMPLATES.flatMap(({prompts}) => prompts.map(({id}) => id))
    )
    .execute()
  await db
    .deleteFrom('MeetingTemplate')
    .where(
      'id',
      'in',
      TEMPLATES.map(({id}) => id)
    )
    .execute()
}
