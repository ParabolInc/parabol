interface Input {
  lemma?: string
  name: string
  salience: number
}

export default class GoogleAnalyzedEntity {
  lemma?: string
  name: string
  salience: number
  constructor(input: Input) {
    const {lemma, name, salience} = input
    this.lemma = lemma || undefined
    this.name = name
    this.salience = salience
  }
}
