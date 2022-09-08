/*
 Usage: jscodeshift --extensions=tsx --parser=tsx --run-in-band -t ./scripts/codeshift/i18n.ts ./packages/client/components/
 Collect strings and wrap them in translation hook
 Running in-band is necessary as the transform also collects and writes the existing translations to i18n/en.json
*/

import {Transform, ASTPath, Function} from 'jscodeshift/src/core'
import { visit } from "ast-types"
import fs from 'fs'
import stringify from 'json-stable-stringify'
import _ from 'lodash'

const getFunctionName = (fd: ASTPath<Function>) => {
  if (fd.value.type === 'ArrowFunctionExpression') {
    return fd.parentPath.value.id?.name
  }
  if (fd.value.type === 'FunctionDeclaration') {
    return fd.value.id.name
  }
}

const isUpperCase = (s: string) => /^[A-Z].*$/.test(s)
const isUpperCaseWord = (s: string) => /^[A-Z][a-z]*$/.test(s)

const isComponent = (fd: ASTPath<Function>) => {
  return isUpperCase(getFunctionName(fd))
}

const camelCase = (s: string): string => _.camelCase(s)
const pascalCase = (s: string): string => _.upperFirst(_.camelCase(s))

const readTranslations = () => {
  try {
    const data = fs.readFileSync('static/translations/en.json')
    return JSON.parse(data.toString())
  } catch(e) {// does not exist
    return {}
  }
}
const translations = readTranslations()
const writeTranslations = () => {
  fs.writeFileSync('static/translations/en.json', stringify(translations, {space: 2}))
}
const addTranslation = (component: string, key: string, text: string) => {
  translations[component] = {
    ...translations[component],
    [key]: text
  }
}

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {source} = fileInfo

  const root = j(source)

  const fdeclarations = root.find(j.Function)
  let addImport = false

  fdeclarations.forEach(fd => {
    if (isComponent(fd)) {
      let addHook = false
      const translationComments = [] as string[]

      visit(fd.node, {
        visitLiteral(fe) {
          const text = fe.value.value?.toString().trim()
          const key = pascalCase(text)

          // skip whitespace
          if (!text || !key) return false

          const component = getFunctionName(fd)

          const callExpression = j.callExpression.from({
            callee: j.identifier('t'),
            arguments: [
              j.literal(`${component}.${key}`)
            ]
          })

          if (fe.value.type === 'JSXText') {
            addHook = true
            fe.replace(j.jsxExpressionContainer.from({
              expression: callExpression
            }))
            addTranslation(component, key, text)
          }
          else if(fe.value.type === 'StringLiteral' && fe.parent.value.type === 'JSXExpressionContainer') {
            addHook = true
            fe.replace(callExpression)
            addTranslation(component, key, text)
          }
          // likelihood is high that this is display text, let's wrap it, easier to remove than add
          else if(text.includes(' ') || isUpperCaseWord(text)) {
            // skip strings which are keys of objects
            if (fe.parentPath.value.type === 'ObjectProperty' && fe.parentPath.value.value !== fe.value) {
              return false
            }
            addHook = true
            if (fe.parentPath.value.type === 'JSXAttribute') {
              fe.replace(j.jsxExpressionContainer(callExpression))
            }
            else {
              fe.replace(callExpression)
            }
            addTranslation(component, key, text)
          }
          return false
        },
        visitTemplateLiteral(fe) {
          if (fe.parentPath.value.type === 'TaggedTemplateExpression') {//graphql`
            return false
          }
          addHook = true
          let text = ''
          const expressions = j.objectExpression([])

          let i = 0
          for (; i < fe.value.expressions.length; ++i) {
            const expression = fe.value.expressions[i]
            const expressionKey = camelCase(j(expression).toSource())
            text += fe.value.quasis[i].value.cooked
            text += `{{${expressionKey}}}`

            expressions.properties.push(j.objectProperty.from({
              key: j.identifier(expressionKey),
              value: expression,
              shorthand: expression.type === 'Identifier' && expression.name === expressionKey
            }))
          }
          text += fe.value.quasis[i].value.cooked

          const key = pascalCase(text)
          const component = getFunctionName(fd)

          const callExpression = j.callExpression.from({
            callee: j.identifier('t'),
            arguments: [
              j.literal(`${component}.${key}`),
              expressions
            ]
          })

          fe.replace(callExpression)
          addTranslation(component, key, text)
          return false
        },
      })

      if (addHook) {
        addImport = true

        const hook = j.variableDeclaration.from({
          kind: 'const',
          declarations: [
            j.variableDeclarator.from({
              id: j.objectPattern([
                j.objectProperty.from({
                  key: j.identifier('t'),
                  value: j.identifier('t'),
                  shorthand: true
                })
              ]),
              init: j.callExpression.from({
                callee: j.identifier('useTranslation'),
                arguments: []
              }),
            })
          ]
        })
        if (translationComments.length) {
          hook.comments = translationComments.map((comment) => (j.commentLine(comment)))
        }

        // put useTranslation after props deconstruction
        // this will fail for funcitons without a body, i.e. () => (<></>) but it's not worth fixing for a one shot script
        const firstBlock = fd.value.body.body[0]
        const firstDeclaration = firstBlock.type === "VariableDeclaration" && firstBlock.declarations[0]
        if ((firstDeclaration as any)?.init?.name === 'props') {
          fd.value.body.body.unshift(firstBlock)
          fd.value.body.body[1] = hook
        }
        else {
          fd.value.body.body.unshift(hook)
        }
      }
    }
  })
  if (addImport) {
    const i18nextImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('useTranslation'))],
      j.stringLiteral('react-i18next'),
    );

    const imports = root.find(j.ImportDeclaration)
    if (imports.length) {
      j(imports.at(0).get()).insertBefore(i18nextImport)
    } else {
      root.get().node.program.body.unshift(i18nextImport)
    }
  }

  writeTranslations()
  return root.toSource()
}

module.exports = transform
module.exports.parser = 'tsx'; 
