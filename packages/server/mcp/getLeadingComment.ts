import {type ASTNode, type Token, TokenKind} from 'graphql'

const getLeadingComment = (node: ASTNode): string | undefined => {
  if (!node.loc) return undefined
  const lines: string[] = []
  let expectedLine = node.loc.startToken.line - 1
  let token: Token | null = node.loc.startToken.prev
  while (token && token.kind === TokenKind.COMMENT && token.line === expectedLine) {
    lines.unshift(token.value.replace(/^ /, '').trim())
    expectedLine--
    token = token.prev
  }
  return lines.length > 0 ? lines.join(' ') : undefined
}

export default getLeadingComment
