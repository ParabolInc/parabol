import j from 'jscodeshift/src/core'

const parseArgs = require('minimist')
const fs = require('fs')
const path = require('path')
const tsParser = require('jscodeshift/parser/ts')

const PROJECT_ROOT = path.join(__dirname, '../../')

const toPascal = (camelStr: string) => camelStr[0].toUpperCase() + camelStr.slice(1)
const toPayloadName = (str: string) => `${toPascal(str)}Payload`
const toSuccessName = (str: string) => `${toPascal(str)}Success`

const createServerMutation = (camelMutationName: string, subscription?: Lowercase<string>) => {
  const MUTATIONS_ROOT = path.join(
    PROJECT_ROOT,
    'packages',
    'server',
    'graphql',
    'public',
    'mutations'
  )
  const mutationPath = path.join(MUTATIONS_ROOT, `${camelMutationName}.ts`)
  if (fs.existsSync(mutationPath)) {
    console.log('mutation already exists! aborting...')
    // return
  }

  const baseMutation = fs.readFileSync(
    path.join(PROJECT_ROOT, 'scripts/codeshift', 'baseMutation.ts'),
    'utf-8'
  )
  const ast = j(baseMutation, {parser: tsParser()})
  // rename mutation
  ast.findVariableDeclarators('MUTATION_NAME').renameTo(camelMutationName)
  // rename export
  ast.find(j.ExportDefaultDeclaration).forEach((path) => {
    ;(path.value.declaration as any).name = camelMutationName
  })

  // add the publisher
  if (subscription) {
    ast
      .find(j.ImportDeclaration)
      .at(-1)
      .insertBefore(`import {SubscriptionChannel} from 'parabol-client/types/constEnums'`)
    const channel = `SubscriptionChannel.${subscription.toUpperCase()}`
    const variable = subscription + 'Id'
    const success = toSuccessName(camelMutationName)
    ast
      .find(j.ReturnStatement)
      // .insertBefore(`const data = {${variable}}`)
      .insertBefore(`publish(${channel}, ${variable}, '${success}', data, subOptions)`)
    ast.findVariableDeclarators('data').replaceWith(`data = {${variable}}`)
  }

  const res = ast.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })

  fs.writeFileSync(mutationPath, res)
}

const createServerTypeDef = (camelMutationName: string) => {
  const payloadName = toPayloadName(camelMutationName)
  const successName = toSuccessName(camelMutationName)
  // simple string replacement
  const basePayload = fs.readFileSync(
    path.join(PROJECT_ROOT, 'scripts/codeshift', 'basePayload.graphql'),
    'utf-8'
  )
  const nextPayload = basePayload
    .replace(/MUTATION_PAYLOAD/g, payloadName)
    .replace(/SUCCESS_PAYLOAD/g, successName)
    .replace(/MUTATION_NAME/g, camelMutationName)
  const TYPEDEF_ROOT = path.join(
    PROJECT_ROOT,
    'packages',
    'server',
    'public',
    'graphql',
    'typeDefs'
  )
  const payloadPath = path.join(TYPEDEF_ROOT, `${camelMutationName}.graphql`)
  fs.writeFileSync(payloadPath, nextPayload)
}

const addToRootMutation = (camelMutationName: string) => {
  const rootMutationPath = path.join(
    PROJECT_ROOT,
    'packages',
    'server',
    'graphql',
    'rootMutation.ts'
  )
  const rootMutation = fs.readFileSync(rootMutationPath, 'utf-8')
  const ast = j(rootMutation, {parser: tsParser()})
  const alreadyImported =
    ast.find(j.ImportDeclaration, {
      specifiers: [
        {
          local: {
            name: camelMutationName
          }
        }
      ]
    }).length > 0
  if (alreadyImported) {
    console.log('Already imported into rootMutation')
    return
  }

  ast
    .find(j.ImportDeclaration)
    .at(-1)
    .insertBefore(`import ${camelMutationName} from './mutations/${camelMutationName}'`)

  const objectPath = ast.find(j.ObjectExpression).at(1).get()
  const entry = j.objectProperty.from({
    key: j.identifier(camelMutationName),
    value: j.identifier(camelMutationName),
    shorthand: true
  })
  objectPath.value.properties.push(entry)

  const res = ast.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
  fs.writeFileSync(rootMutationPath, res)
}

const addToRootSubscription = (camelMutationName: string, subscription?: Lowercase<string>) => {
  if (!subscription) return
  const fileName = toPascal(subscription) + 'SubscriptionPayload.ts'
  const subPath = path.join(PROJECT_ROOT, 'packages', 'server', 'graphql', 'types', fileName)
  const sub = fs.readFileSync(subPath, 'utf-8')
  const payloadName = toPayloadName(camelMutationName)
  const successName = toSuccessName(camelMutationName)
  const ast = j(sub, {parser: tsParser()})
  const alreadyImported =
    ast.find(j.ImportDeclaration, {
      specifiers: [
        {
          local: {
            name: successName
          }
        }
      ]
    }).length > 0
  if (alreadyImported) {
    console.log('Already imported into rootMutation')
    return
  }
  // add import
  ast
    .find(j.ImportDeclaration)
    .at(-1)
    .insertBefore(`import {${successName}} from './${payloadName}'`)

  const payloadArr = ast.find(j.ArrayExpression).get()
  payloadArr.value.elements.push(j.identifier(successName))
  const res = ast.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
  fs.writeFileSync(subPath, res)
}

const createClientMutation = (camelMutationName: string, subscription?: Lowercase<string>) => {
  const lowercaseSub = subscription ?? 'part'
  const pascalMutation = toPascal(camelMutationName)
  const fileName = pascalMutation + 'Mutation.ts'
  const mutationPath = path.join(PROJECT_ROOT, 'packages/client/mutations', fileName)

  const basePath = path.join(PROJECT_ROOT, 'scripts/codeshift', 'baseClientMutation.ts')
  const baseStr = fs.readFileSync(basePath, 'utf-8')
  const nextStr = baseStr
    .replace(/PASCAL_MUTATION/g, pascalMutation)
    .replace(/MUTATION_NAME/g, camelMutationName)
    .replace(/LCASE_SUB/g, lowercaseSub)
  fs.writeFileSync(mutationPath, nextStr)
}

const addToClientSubscription = (camelMutationName: string, subscription?: Lowercase<string>) => {
  if (!subscription) return
  const fileName = toPascal(subscription) + 'Subscription.ts'
  const subPath = path.join(PROJECT_ROOT, 'packages/client/subscriptions', fileName)
  const pascalMutation = toPascal(camelMutationName) + 'Mutation'
  const fragment = `      ...${pascalMutation}_${subscription} @relay(mask: false)`
  const subStr = fs.readFileSync(subPath, 'utf-8')
  const typename = '__typename'
  const nextStr = subStr.replace(typename, typename + '\n' + fragment)
  fs.writeFileSync(subPath, nextStr)
}

const newMutation = () => {
  const argv = parseArgs(process.argv.slice(2), {
    alias: {
      s: 'subscription',
      f: 'field'
    }
  })

  const rawMutationName = argv._[0]
  if (!rawMutationName) {
    console.log('Please provide a mutation name as the first argument')
    return
  }
  const camelMutationName = rawMutationName[0].toLowerCase() + rawMutationName.slice(1)
  const lcaseSubscription =
    typeof argv.subscription === 'string' ? argv.subscription.toLowerCase().trim() : null
  createServerMutation(camelMutationName, lcaseSubscription)
  createServerTypeDef(camelMutationName)

  addToRootSubscription(camelMutationName, lcaseSubscription)
  addToRootMutation(camelMutationName)

  createClientMutation(camelMutationName, lcaseSubscription)
  addToClientSubscription(camelMutationName, lcaseSubscription)
}
newMutation()
