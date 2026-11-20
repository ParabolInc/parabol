// A service names a kind of issue in title case, like 'Pull Request'; a label reads it in sentence case
const inspirationKindLabel = (kind: string) => kind.charAt(0) + kind.slice(1).toLowerCase()

export default inspirationKindLabel
