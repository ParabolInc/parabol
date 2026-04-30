import {costLimitRule} from '@escape.tech/graphql-armor-cost-limit'
import {maxAliasesRule} from '@escape.tech/graphql-armor-max-aliases'
import {maxDepthRule} from '@escape.tech/graphql-armor-max-depth'
import {maxDirectivesRule} from '@escape.tech/graphql-armor-max-directives'
import {MaxTokensParserWLexer} from '@escape.tech/graphql-armor-max-tokens'
import {Source} from 'graphql'
import {ParseOptions} from 'graphql/language/parser'
import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'

function parseWithTokenLimit(source: string | Source, options?: ParseOptions) {
  const parser = new MaxTokensParserWLexer(source, {...options, n: 1000})
  return parser.parseDocument()
}

export const useArmor = (): Plugin<ServerContext> => {
  return {
    async onParams({request, context}) {
      const body = await request.json()
      // set the docId so we know which are persisted (i.e. trusted)
      ;(context as ServerContext).docId = body.docId
    },
    onParse({setParseFn, context}) {
      const {authToken, docId} = context
      const isSuperUser = authToken?.rol === 'su'
      if (!docId && !isSuperUser) {
        setParseFn(parseWithTokenLimit)
      }
    },
    onValidate({addValidationRule, context}) {
      const {authToken, docId} = context
      const isSuperUser = authToken?.rol === 'su'
      if (!docId && !isSuperUser) {
        addValidationRule(costLimitRule())
        addValidationRule(maxAliasesRule())
        addValidationRule(maxDepthRule())
        addValidationRule(maxDirectivesRule())
      }
    }
  }
}
