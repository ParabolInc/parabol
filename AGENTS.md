Never cast a type `as any`

## Project Architecture

- **Place shared client-server logic in packages/client/shared/.** When logic like validation, converters, or utilities is needed by both client and server, implement it once in \`packages/client/shared/\` and import from there. The server should import these using relative paths from the client package rather than maintaining duplicate implementations. This ensures consistent behavior across both environments and eliminates code duplication.
  ```
  // Good
    // packages/client/shared/passwordStrength.ts
    // Used by both client and server
    export const checkPasswordStrength = (pwd: string) => { /* ... */ }
    
    // Server importing from shared client code
    import {checkPasswordStrength} from '../../../../client/shared/passwordStrength'
    import {convertTipTapToADF} from '../../../../client/shared/tiptap/convertTipTapToADF'
    
    // Client importing normally
    import {checkPasswordStrength} from 'parabol-client/shared/passwordStrength'

  // Bad
    // Duplicating validation in both client and server
    // packages/client/utils/validatePassword.ts
    export const checkPasswordStrength = (pwd: string) => { /* one implementation */ }
    
    // packages/server/utils/validatePassword.ts
    export const checkPasswordStrength = (pwd: string) => { /* duplicate implementation */ }
    
    // OR: Separate server-side converter
    // packages/server/utils/convertTipTapToADF.ts
    import fnTranslate from 'md-to-adf'
    export const convertTipTapToADF = (content: JSONContent) => {
      const markdown = convertTipTapToMarkdown(content)
      return fnTranslate(markdown)
    }
  ```

## Backend Patterns

- **Use Kysely query builder for all database operations.** All database queries use the Kysely typed query builder accessed via getKysely(). Insert, select, update, and delete operations use Kysely's fluent API with typed table names. Use .onConflict() for upserts, .executeTakeFirst() for single rows, .execute() for bulk operations. Never use raw SQL strings except for complex expressions via sql\`\` template tag.
  ```
  // Good
    const pg = getKysely()
    const result = await pg
      .selectFrom('PasswordResetRequest')
      .selectAll()
      .where('tokenHash', '=', tokenHash)
      .executeTakeFirst()

  // Bad
    const result = await pg.query(
      'SELECT * FROM "PasswordResetRequest" WHERE "tokenHash" = $1',
      [tokenHash]
    )
  ```

- **Use fire-and-forget pattern for non-critical external API syncs.** When syncing data to external services (Jira, Slack, etc.) as a side effect of a mutation, use a fire-and-forget pattern with \`.catch(() => {})\` so the main mutation response is not blocked or affected by external API failures. Add a comment explaining the intentional fire-and-forget.
  ```
  // Good
    // fire-and-forget; don't block the response on Jira's API
    manager.updateDescription(cloudId, issueKey, adf).catch(() => {})

  // Bad
    // Blocking the mutation response on external API call
    const result = await manager.updateDescription(cloudId, issueKey, adf)
    if (!result.ok) {
      return standardError(new Error('Failed to sync to Jira'))
    }
  ```

- **Use INSERT...SELECT instead of INSERT...VALUES to avoid FK violations with concurrent deletes.** When inserting rows that reference another table and the referenced row might be concurrently deleted, use INSERT...SELECT from the referenced table instead of INSERT...VALUES. This makes the insert a no-op when the target row doesn't exist, avoiding a foreign key violation without needing a try/catch.
  ```
  // Good
    pg.insertInto('PageBacklink')
      .columns(['toPageId', 'fromPageId'])
      .expression(
        pg.selectFrom('Page')
          .select((eb) => ['id as toPageId', eb.val(fromPageId).as('fromPageId')])
          .where('id', '=', addToPageId)
      )
      .onConflict((oc) => oc.doNothing())
      .execute()

  // Bad
    pg.insertInto('PageBacklink')
      .values({ toPageId: addToPageId, fromPageId })
      .onConflict((oc) => oc.doNothing())
      .execute()
    // Throws FK violation if Page is deleted between check and insert
  ```
