export const withQueryInstruction = (query: string, instruction: string | undefined) =>
  instruction?.trim() ? `Instruct: ${instruction.trim()}\nQuery:${query}` : query
