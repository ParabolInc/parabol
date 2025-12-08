require('dotenv').config()
const {default: getKysely} = require('../packages/server/postgres/getKysely')
const {default: getModelManager} = require('../packages/embedder/ai_models/ModelManager')
const {default: search} = require('../packages/server/graphql/public/queries/search')

const verify = async () => {
  console.log('--- Starting Verification ---')

  // 1. Verify Chunking Logic
  console.log('\n[1] Verifying Chunking Strategy...')
  const modelManager = getModelManager()
  const model = modelManager.getEmbedder('Embeddings_ember_1')

  if (!model) {
    console.error('❌ Model Embeddings_ember_1 not found')
    return
  }

  const longText = 'Target sentence 1. '.repeat(50) + 'Target sentence 2. '.repeat(50)
  // Mock maxInputTokens if needed, but it should be set in constructor
  // We can't easily change it, but we can test if it chunks.

  const chunks = await model.chunkText(longText)
  if (chunks instanceof Error) {
    console.error('❌ Chunking failed:', chunks)
  } else {
    console.log(
      `✅ Chunking success. Generated ${chunks.length} chunks from text length ${longText.length}.`
    )
    console.log(`   Sample chunk 0 length: ${chunks[0].length}`)
    if (chunks.length > 1) {
      console.log(`   Sample chunk 1 length: ${chunks[1].length}`)
      // Simple overlap check
      const last10 = chunks[0].slice(-10)
      const inNext = chunks[1].includes(last10)
      console.log(`   Overlap check: Last 10 chars of chunk 0 found in chunk 1? ${inNext}`)
    }
  }

  // 1.5 Seed "Apples" Page for Repro
  console.log('\n[1.5] Seeding "Apples" Page...')
  const pg = getKysely()

  // Create Organization first
  await pg
    .insertInto('Organization')
    .values({id: 'org1', name: 'Test Org'} as any)
    .onConflict((oc) => oc.doNothing())
    .execute()

  // Create Team first
  await pg
    .insertInto('Team')
    .values({id: 1, name: 'Test Team', orgId: 'org1'} as any)
    .onConflict((oc) => oc.doNothing())
    .execute()

  // Create User first
  await pg
    .insertInto('User')
    .values({
      id: 'u1',
      email: 'test@example.com',
      preferredName: 'Test User',
      picture: ''
    } as any)
    .onConflict((oc) => oc.doNothing())
    .execute()
  await pg
    .insertInto('TeamMember')
    .values({id: 'tm1', userId: 'u1', teamId: 1, isNotRemoved: true} as any)
    .onConflict((oc) => oc.doNothing())
    .execute()

  // Clean up old if exists
  await pg.deleteFrom('Page').where('title', '=', 'Apples').execute()

  // Create Page
  const {id: pageId} = await pg
    .insertInto('Page')
    .values({
      title: 'Apples',
      plaintextContent:
        'Fruits are nice. But I especially like apples.\n\nYay apples. I think Washington Honeycrisp are overrated.',
      teamId: 1, // Mock team
      userId: 'u1',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)
    .returning('id')
    .executeTakeFirstOrThrow()

  // Queue Embedding (simulate queuePageEmbedding)
  // We need to create EmbeddingsMetadata & Job
  await pg
    .insertInto('EmbeddingsMetadata')
    .values({
      objectType: 'page',
      refId: pageId,
      refUpdatedAt: new Date(),
      teamId: 1,
      userId: 'u1'
      // We leave fullText empty to force embedMetadata to generate it
    } as any)
    .execute()

  // Manually run embedMetadata workflow for this page
  const metadata = await pg
    .selectFrom('EmbeddingsMetadata')
    .select('id')
    .where('refId', '=', pageId)
    .where('objectType', '=', 'page')
    .executeTakeFirstOrThrow()

  console.log('   Embedding page...')
  const {embedMetadata} = require('../packages/embedder/workflows/embedMetadata')
  // Force build text to test our new createTextFromPage logic
  await embedMetadata({
    data: {
      embeddingsMetadataId: metadata.id,
      model: 'Embeddings_ember_1',
      forceBuildText: true
    },
    dataLoader: {
      get: (t: string) => ({
        load: (id: string) => {
          let tableName = t
          if (t === 'embeddingsMetadata') tableName = 'EmbeddingsMetadata'
          if (t === 'page' || t === 'pages') tableName = 'Page'
          console.log(`Debug: Loading ${t} (${tableName}) id=${id}`)
          return pg
            .selectFrom(tableName)
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst()
            .then((res) => {
              console.log(`Debug: Loaded ${tableName} result:`, res ? 'FOUND' : 'NULL')
              return res
            })
        }
      })
    } // Mock Loader
  })

  // 2. Verify Search Logic (Smoke Test)
  console.log('\n[2] Verifying Search Query Execution...')
  const query = 'honeycrisp'

  try {
    // Mock context with injected userId to bypass JWT auth for testing
    const context = {authToken: null, userId: 'u1'}
    const res = await search({}, {query: 'honeycrisp', limit: 100}, context)

    console.log(`✅ Search executed successfully.`)
    console.log(`   Total Count: ${res.totalCount}`)
    console.log(`   Results returned: ${res.results.length}`)

    const targetResult = res.results.find((r) => r.id === String(pageId))

    if (targetResult) {
      const first = targetResult
      console.log('   Target Result:', {
        id: first.id,
        title: first.title, // Should be "Apples"
        score: first.score,
        vectorScore: first.vectorScore, // Should be > 0
        keywordScore: first.keywordScore, // Should be > 0
        snippet: first.snippet
      })

      if (first.title === 'Untitled') {
        console.error('   ❌ Title is STILL "Untitled" - Join failed?')
      } else {
        console.log(`   ✅ Title is "${first.title}"`)
      }

      // Check scores
      if (first.vectorScore > 0 && first.vectorScore <= 1 && first.keywordScore >= 0) {
        console.log(
          `   ✅ Scores seem valid floats: Vector=${first.vectorScore.toFixed(4)}, Keyword=${first.keywordScore.toFixed(4)}`
        )
      } else if (first.vectorScore >= 1 && Number.isInteger(first.vectorScore)) {
        console.error(`   ❌ Vector Score is integer ${first.vectorScore}? Should be float.`)
      } else {
        console.log(
          `   ❓ Scores state: Vector=${first.vectorScore}, Keyword=${first.keywordScore}`
        )
      }

      // Check URL
      if (typeof first.url === 'string' && first.url.startsWith('/pages/')) {
        console.log(`   ✅ URL is present and valid: ${first.url}`)
      } else {
        console.error(`   ❌ URL missing or invalid: ${first.url}`)
      }
    } else {
      console.log('   (No results found for "honeycrisp". Check indexing or permissions)')
      console.log(
        '   Returned IDs:',
        res.results.map((r) => r.id)
      )
    }
  } catch (e) {
    console.error('❌ Search failed:', e)
  }

  try {
    const {fullText} = await pg
      .selectFrom('EmbeddingsMetadata')
      .select('fullText')
      .where('id', '=', metadata.id)
      .executeTakeFirstOrThrow()
    console.log('   Metadata FullText Preview:\n', fullText)

    // Check embeddings chunks
    const chunks = await pg
      .selectFrom('Embeddings_ember_1')
      .select('embedText')
      .where('embeddingsMetadataId', '=', metadata.id)
      .execute()
    console.log(`   Generated ${chunks.length} chunks.`)
    const honeyChunk = chunks.find((c) => c.embedText.toLowerCase().includes('honeycrisp'))
    if (honeyChunk) {
      console.log('   ✅ "honeycrisp" found in chunk.')
    } else {
      console.error('   ❌ "honeycrisp" NOT found in any chunk!')
    }
  } catch (e) {
    console.error(e)
  }
}

verify()
  .then(() => {
    console.log('\n--- Verification Complete ---')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
