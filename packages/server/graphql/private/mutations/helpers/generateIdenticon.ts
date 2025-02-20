import {createAvatar} from '@dicebear/core'
import * as initials from '@dicebear/initials'
import sharp from 'sharp'
import {themeBackgroundColors} from '../../../../../client/shared/themeBackgroundColors'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'
export const generateIdenticon = async (userId: string, name: string) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  // 500 color value from our theme

  const seed =
    name
      .toLowerCase()
      .split('')
      .filter((letter) => letters.includes(letter))
      .slice(0, 2)
      .join('') || 'pa'
  const avatar = createAvatar(initials, {
    seed,
    backgroundColor: themeBackgroundColors,
    fontFamily: ['IBM Plex Sans']
  })
  const svgBuffer = await avatar.toArrayBuffer()
  const pngBuffer = await sharp(svgBuffer as ArrayBuffer)
    .png()
    .toBuffer()
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(pngBuffer, userId, 'png')
  return publicLocation
}
