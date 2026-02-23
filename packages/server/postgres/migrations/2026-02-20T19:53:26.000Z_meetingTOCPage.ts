import {type Kysely, sql} from 'kysely'
import * as Y from 'yjs'
import {encodeStateAsUpdate} from 'yjs'
import {CipherId} from '../../utils/CipherId'

export const selectDescendantPages = (db: any, pageId: number) =>
  db.withRecursive('descendants', (qc: any) =>
    qc
      .selectFrom('Page')
      .select(['id', 'parentPageId'])
      .where('id', '=', pageId)
      .unionAll(
        qc
          .selectFrom('Page as p')
          .innerJoin('descendants as d', 'd.id', 'p.parentPageId')
          .where('p.isParentLinked', '=', true)
          .select(['p.id', 'p.parentPageId'])
      )
  )
export const updatePageAccessTable = async (trx: any, pageId: number) => {
  const res = selectDescendantPages(trx, pageId)
    .with('unionAccess', (qc: any) =>
      qc
        .selectFrom('PageUserAccess')
        .select(['userId', 'pageId', 'role'])
        .where('pageId', 'in', (eb: any) => eb.selectFrom('descendants').select('id'))
        .unionAll(({parens, selectFrom}: any) =>
          parens(
            selectFrom('PageTeamAccess')
              .where('pageId', 'in', (eb: any) => eb.selectFrom('descendants').select('id'))
              .innerJoin('TeamMember', 'PageTeamAccess.teamId', 'TeamMember.teamId')
              .where('TeamMember.isNotRemoved', '=', true)
              .select(['TeamMember.userId', 'pageId', 'role'])
          )
        )
    )
    .with('nextPageAccess', (qc: any) =>
      qc
        .selectFrom('unionAccess')
        .select(({fn}: any) => ['userId', 'pageId', fn.min('role').as('role')])
        .groupBy(['userId', 'pageId'])
    )
    .with('insertNew', (qc: any) =>
      qc
        .insertInto('PageAccess')
        .columns(['userId', 'pageId', 'role'])
        .expression((eb: any) =>
          eb.selectFrom('nextPageAccess').select(['userId', 'pageId', 'role'])
        )
        .onConflict((oc: any) =>
          oc
            .columns(['userId', 'pageId'])
            .doUpdateSet((eb: any) => ({
              role: eb.ref('excluded.role')
            }))
            .where(({eb, ref}: any) =>
              eb('PageAccess.role', 'is distinct from', ref('excluded.role'))
            )
        )
    )
  await res.selectNoFrom(sql`1`.as('t')).execute()
}

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Schema changes
  await Promise.all([
    db.schema
      .alterTable('Page')
      .addColumn('isMeetingTOC', 'boolean', (col) => col.notNull().defaultTo(false))
      .execute(),
    db.schema
      .alterTable('Team')
      .addColumn('meetingTOCpageId', 'integer', (col) =>
        col.references('Page.id').onDelete('set null')
      )
      .execute()
  ])

  const BATCH_SIZE = 10000
  let lastSeenTeamId = ''
  for (let i = 0; i < 1e6; i++) {
    console.log('meetingTOCPage batch', i + 1)
    const teams = await db
      .selectFrom('Team')
      .select(['id', 'createdBy'])
      .where('id', '>', lastSeenTeamId)
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()

    if (teams.length === 0) break
    lastSeenTeamId = teams.at(-1)!.id

    await Promise.all(
      teams.map(async (team) => {
        const {id: teamId} = team

        // Get summary pages for this team, most recent first
        const summaryPages = await db
          .selectFrom('Page')
          .select(['id', 'title', 'userId', 'createdAt'])
          .where('teamId', '=', teamId)
          .where('summaryMeetingId', 'is not', null)
          .where('deletedAt', 'is', null)
          .orderBy('createdAt', 'desc')
          .execute()
        if (summaryPages.length === 0) return
        // Determine TOC owner: prefer the most recent summary page's userId, fall back to createdBy
        const tocUserId = summaryPages[0]?.userId ?? team.createdBy
        if (!tocUserId) return

        // Build yDoc for the TOC page with heading + canonical pageLinkBlocks
        const doc = new Y.Doc()
        const frag = doc.getXmlFragment('default')

        // Position 0: heading
        const heading = new Y.XmlElement('heading')
        heading.setAttribute('level', 1 as any)
        const headingText = new Y.XmlText()
        headingText.insert(0, 'Meeting Summaries')
        heading.insert(0, [headingText])
        frag.insert(0, [heading])

        // Positions 1+: canonical pageLinkBlock for each summary page (most recent first)
        for (let j = 0; j < summaryPages.length; j++) {
          const {id: pageId, title} = summaryPages[j]!
          const pageCode = CipherId.encrypt(pageId)
          const el = new Y.XmlElement('pageLinkBlock')
          el.setAttribute('pageCode', pageCode as any)
          el.setAttribute('title', title ?? '<Untitled>')
          el.setAttribute('canonical', true as any)
          frag.insert(j + 1, [el])
        }

        const yDoc = Buffer.from(encodeStateAsUpdate(doc))

        // INSERT the TOC page — addAccessOnNewPage trigger handles PageTeamAccess + PageUserAccess automatically
        const tocPage = await db
          .insertInto('Page')
          .values({
            userId: tocUserId,
            teamId,
            isMeetingTOC: true,
            isPrivate: false,
            title: 'Meeting Summaries',
            yDoc,
            sortOrder: '!',
            isParentLinked: true
          })
          .returning('id')
          .executeTakeFirstOrThrow()

        const tocPageId = tocPage.id
        await Promise.all([
          db
            .insertInto('PageUserAccess')
            .values({userId: tocUserId, pageId: tocPageId, role: 'owner'})
            .execute(),
          db
            .insertInto('PageTeamAccess')
            .values({teamId, pageId: tocPageId, role: 'editor'})
            .execute()
        ])

        await updatePageAccessTable(db, tocPageId)

        await Promise.all([
          // UPDATE Team.meetingTOCpageId
          db
            .updateTable('Team')
            .set({meetingTOCpageId: tocPageId})
            .where('id', '=', teamId)
            .execute(),
          // Reparent summary pages under the TOC page
          db
            .updateTable('Page')
            .set({
              teamId: null,
              parentPageId: tocPageId,
              ancestorIds: [tocPageId],
              sortOrder: '',
              isParentLinked: true
            })
            .where('teamId', '=', teamId)
            .where('summaryMeetingId', 'is not', null)
            .where('deletedAt', 'is', null)
            .execute()
        ])
      })
    )
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Restore summary pages back to top-level team pages
  await db
    .updateTable('Page')
    .set((eb) => ({
      teamId: eb
        .selectFrom('Team')
        .select('Team.id')
        .whereRef('Team.meetingTOCpageId', '=', 'Page.parentPageId')
        .limit(1),
      parentPageId: null,
      ancestorIds: [],
      sortOrder: '!'
    }))
    .where('summaryMeetingId', 'is not', null)
    .where('parentPageId', 'is not', null)
    .execute()

  // Delete TOC pages
  await db.deleteFrom('Page').where('isMeetingTOC', '=', true).execute()

  await db.schema.alterTable('Team').dropColumn('meetingTOCpageId').execute()
  await db.schema.alterTable('Page').dropColumn('isMeetingTOC').execute()
}
