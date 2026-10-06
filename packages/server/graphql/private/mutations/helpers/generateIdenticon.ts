import sharp from 'sharp'
import {initials as getInitials} from '../../../../../client/shared/initials'
import {selectThemeBackgroundColor} from '../../../../../client/shared/selectThemeBackgroundColor'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'
import identiconGlyphs from './identiconGlyphs'

const {unitsPerEm, glyphs, kerning} = identiconGlyphs
const FONT_SCALE = 50 / unitsPerEm
const BASELINE = 67.8

export const generateIdenticon = async (userId: string, name: string) => {
  const initials = getInitials(name, 'pa')
  const backgroundColor = selectThemeBackgroundColor(initials)
  let width = 0
  let paths = ''
  let previousChar = ''
  for (const char of initials) {
    const glyph = glyphs[char]
    if (!glyph) continue
    width += kerning[previousChar + char] ?? 0
    paths += `<path transform="translate(${width})" d="${glyph.path}"/>`
    width += glyph.advance
    previousChar = char
  }
  const left = 50 - (width * FONT_SCALE) / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#${backgroundColor}"/><g fill="#fff" transform="translate(${left} ${BASELINE}) scale(${FONT_SCALE} -${FONT_SCALE})">${paths}</g></svg>`
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(pngBuffer, userId, 'png')
  return publicLocation
}
