import fs from 'fs'
import {buildClientSchema, printSchema} from 'graphql'
import fetch from 'node-fetch'

const updateGitHubSchema = async () => {
  const schemaPath = './githubSchema.graphql'
  const schemaJSONPath = './githubSchema.ts'
  const accessToken = 'foobar'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json' as const
  }
  const res = await fetch('https://api.github.com/graphql', {headers})
  const result = await res.json()
  fs.writeFileSync(schemaJSONPath, JSON.stringify(result, null, 2))
  fs.writeFileSync(schemaPath, printSchema(buildClientSchema(result.data)))
}

updateGitHubSchema().catch()
