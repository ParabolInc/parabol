/* WIP to get GH schemas working*/
// import {mergeSchemas, makeExecutableSchema} from 'graphql-tools'
// import rootSchema from './rootSchema'
// import fs from 'fs'
// import * as path from 'path'
//
// const githubSchemaTypeDef = fs.readFileSync(path.join(__dirname, '../utils/githubSchema.graphql'), 'utf8')
// const githubSchema = makeExecutableSchema({typeDefs: githubSchemaTypeDef})
//
// const schema = mergeSchemas({
//   schemas: [
//     githubSchema,
//     rootSchema
//   ]
// })
// console.log('schema', schema)
