import franc from 'franc-min'
import {ISO6391, iso6393To1} from './iso6393To1'
import {URLRegex} from './regex'

export const inferLanguage = (text: string, minLength = 100): ISO6391 | undefined => {
  // URLs make foreign languages look English
  const urlFreeText = text.replaceAll(URLRegex, '')
  // if it's less than 100 chars, we probably don't care anyways
  const iso6393 = franc(urlFreeText, {minLength})
  return iso6393To1[iso6393 as keyof typeof iso6393To1]
}
