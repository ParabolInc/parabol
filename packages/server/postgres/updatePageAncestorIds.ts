import {type ControlledTransaction, type Kysely, sql} from 'kysely'
import type {DB} from './types/pg'

// ancestorIds caches the parentPageId chain, so a move must rewrite it for the page and everything under it
export const updatePageAncestorIds = async (
  db: ControlledTransaction<DB, []> | Kysely<DB>,
  pageId: number
) => {
  await db
    .withRecursive('subtree(id, ancestorIds)', (qc) =>
      qc
        .selectFrom('Page')
        .leftJoin('Page as parent', 'parent.id', 'Page.parentPageId')
        .select((eb) => [
          'Page.id',
          eb
            .case()
            .when('parent.id', 'is', null)
            .then(sql<number[]>`'{}'::int[]`)
            .else(sql<number[]>`${sql.ref('parent.ancestorIds')} || ${sql.ref('parent.id')}`)
            .end()
            .as('ancestorIds')
        ])
        .where('Page.id', '=', pageId)
        .unionAll((eb) =>
          eb
            .selectFrom('Page as child')
            .innerJoin('subtree', 'subtree.id', 'child.parentPageId')
            .select([
              'child.id',
              sql<number[]>`${sql.ref('subtree.ancestorIds')} || ${sql.ref('subtree.id')}`.as(
                'ancestorIds'
              )
            ])
            // a loop in existing parent links would otherwise recurse forever
            .where(
              sql<boolean>`${sql.ref('child.id')} <> all(${sql.ref('subtree.ancestorIds')} || ${sql.ref('subtree.id')})`
            )
        )
    )
    .updateTable('Page')
    .from('subtree')
    .set((eb) => ({ancestorIds: eb.ref('subtree.ancestorIds')}))
    .whereRef('Page.id', '=', 'subtree.id')
    .where(
      sql<boolean>`${sql.ref('Page.ancestorIds')} is distinct from ${sql.ref('subtree.ancestorIds')}`
    )
    .execute()
}
