import type {Kysely} from 'kysely'
import getTemplateIllustrationUrl from '../../graphql/mutations/helpers/getTemplateIllustrationUrl'

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('MeetingTemplate')
    .values({
      id: 'iLikeIWishIWonderTemplate',
      createdAt: new Date('2025-01-08T15:10:42.442Z'),
      isActive: true,
      teamId: 'aGhostTeam',
      updatedAt: new Date('2025-01-08T15:10:42.442Z'),
      scope: 'PUBLIC',
      orgId: 'aGhostOrg',
      name: 'I Like, I Wish, I Wonder',
      type: 'retrospective',
      isStarter: true,
      isFree: true,
      illustrationUrl: getTemplateIllustrationUrl('iLikeIWishIWonderTemplate.png'),
      mainCategory: 'retrospective'
    })
    .execute()
  await db
    .insertInto('ReflectPrompt')
    .values({
      id: 'iLikeIWishIWonderTemplateILikePrompt',
      createdAt: new Date('2025-01-08T15:10:42.442Z'),
      updatedAt: new Date('2025-01-08T15:10:42.442Z'),
      teamId: 'aGhostTeam',
      templateId: 'iLikeIWishIWonderTemplate',
      question: 'I Like',
      description: 'What aspects of our process, collaboration, or team dynamic do you like?',
      sortOrder: '!',
      groupColor: '#52CC52'
    })
    .execute()
  await db
    .insertInto('ReflectPrompt')
    .values({
      id: 'iLikeIWishIWonderTemplateIWishPrompt',
      createdAt: new Date('2025-01-08T15:10:42.442Z'),
      updatedAt: new Date('2025-01-08T15:10:42.442Z'),
      teamId: 'aGhostTeam',
      templateId: 'iLikeIWishIWonderTemplate',
      question: 'I Wish',
      description:
        'Which aspects of our process, collaboration, or team dynamic do you wish were different? In what way do you wish they were different?',
      sortOrder: '*',
      groupColor: '#5CA0E5'
    })
    .execute()
  await db
    .insertInto('ReflectPrompt')
    .values({
      id: 'iLikeIWishIWonderTemplateIWonderPrompt',
      createdAt: new Date('2025-01-08T15:10:42.442Z'),
      updatedAt: new Date('2025-01-08T15:10:42.442Z'),
      teamId: 'aGhostTeam',
      templateId: 'iLikeIWishIWonderTemplate',
      question: 'I Wonder',
      description:
        'What ideas do you have for improving our process, collaboration, or team dynamic? How could we bring your "wishlist" ideas into reality? Consider answering with ”what if we...”',
      sortOrder: '#',
      groupColor: '#AC73E5'
    })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('MeetingTemplate').where('id', '=', 'iLikeIWishIWonderTemplate').execute()
  await db
    .deleteFrom('MeetingTemplate')
    .where('id', 'in', [
      'iLikeIWishIWonderTemplateILikePrompt',
      'iLikeIWishIWonderTemplateIWishPrompt',
      'iLikeIWishIWonderTemplateIWonderPrompt'
    ])
    .execute()
}
