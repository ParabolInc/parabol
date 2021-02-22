export default interface GraphQLIDParser {
  join: (...args: string[]) => string
  split: (id: string) => Record<string, string>
}
