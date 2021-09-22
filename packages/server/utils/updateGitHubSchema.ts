import fs from 'fs'
import {buildClientSchema, printSchema} from 'graphql'
import fetch from 'node-fetch'

const updateGitHubSchema = async () => {
  const schemaPath = './githubSchema.graphql'
  const schemaJSONPath = './githubSchema.ts'
  const accessToken = 'foo'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${accessToken}`,
    // preview is required for label API
    Accept: 'application/vnd.github.bane-preview+json'
  }
  const res = await fetch('https://api.github.com/graphql', {headers})
  const result = await res.json()
  fs.writeFileSync(schemaJSONPath, JSON.stringify(result, null, 2))
  fs.writeFileSync(schemaPath, printSchema(buildClientSchema(result.data)))
}

updateGitHubSchema().catch()
