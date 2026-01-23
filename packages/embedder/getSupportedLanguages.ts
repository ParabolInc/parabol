import {sql} from 'kysely'
import getKysely from '../server/postgres/getKysely'
import {type ISO6391} from './iso6393To1'

let supportedLanguages = new Set<string>()

export const iso6391ToPG = {
  ar: 'arabic',
  hy: 'armenian',
  eu: 'basque',
  ca: 'catalan',
  da: 'danish',
  nl: 'dutch',
  en: 'english',
  fi: 'finnish',
  fr: 'french',
  de: 'german',
  el: 'greek',
  hi: 'hindi',
  hu: 'hungarian',
  id: 'indonesian',
  ga: 'irish',
  it: 'italian',
  lt: 'lithuanian',
  ne: 'nepali',
  no: 'norwegian',
  pt: 'portuguese',
  ro: 'romanian',
  ru: 'russian',
  sr: 'serbian',
  es: 'spanish',
  sv: 'swedish',
  ta: 'tamil',
  tr: 'turkish',
  yi: 'yiddish'
} as const

export type TSVLanguage = NonNullable<ReturnType<typeof getTSV>>
export const getTSV = (language: ISO6391 | undefined | null) => {
  const val = iso6391ToPG[language as keyof typeof iso6391ToPG]
  return supportedLanguages.has(val) ? val : null
}

// Get the list of languages supported by PG for Text Search
export const primeSupportedLanguages = async () => {
  const res = await sql<{cfgname: string}>`SELECT cfgname FROM pg_ts_config;`.execute(getKysely())
  supportedLanguages = new Set(res.rows.map((row) => row.cfgname))
}
