import getKysely from './postgres/getKysely'

async function check() {
  const db = getKysely()
  try {
    console.log('Checking OAuthCode table...')
    const result = await db
      .selectFrom('OAuthCode' as any)
      .selectAll()
      .limit(1)
      .execute()
    console.log('OAuthCode table exists.')

    console.log('Checking for client_id M9O6UZ9DCEDVI22N...')
    const org = await db
      .selectFrom('Organization')
      .selectAll()
      .where('oauthClientId', '=', 'M9O6UZ9DCEDVI22N')
      .executeTakeFirst()

    if (!org) {
      console.log('Organization with client_id NOT FOUND')
    } else {
      console.log('Organization found:', {
        id: org.id,
        oauthClientId: org.oauthClientId,
        oauthRedirectUris: org.oauthRedirectUris
      })

      // Try to insert a dummy code
      console.log('Attempting to insert dummy OAuthCode...')
      const code = {
        id: 'test-code-' + Date.now(),
        clientId: 'M9O6UZ9DCEDVI22N',
        redirectUri: 'http://localhost:8080/callback',
        userId: org.id, // Use org ID as user ID for testing if user not found, or fetch a user
        scopes: ['graphql:query'],
        createdAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 600
      }

      // We need a valid userId. Let's fetch one.
      const user = await db.selectFrom('User').select('id').limit(1).executeTakeFirst()
      if (user) {
        code.userId = user.id
        await db.insertInto('OAuthCode').values(code).execute()
        console.log('Dummy OAuthCode inserted successfully!')

        // Clean up
        await db.deleteFrom('OAuthCode').where('id', '=', code.id).execute()
        console.log('Dummy OAuthCode deleted.')
      } else {
        console.log('No user found to test insertion.')
      }
    }
  } catch (err) {
    console.error('Error checking DB:', err)
  }
  process.exit(0)
}

check()
