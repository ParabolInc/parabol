import {createAvatar} from '@dicebear/core'
import * as initials from '@dicebear/initials'
import sharp from 'sharp'
import tailwindPreset from '../../../../../client/tailwindTheme'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'

export const generateIdenticon = async (userId: string, name: string) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const {colors} = tailwindPreset.theme
  const backgroundColor = Object.values(colors)
    .map((color) => {
      return color['500']?.slice(1) ?? undefined
    })
    .filter(Boolean)

  const seed =
    name
      .toLowerCase()
      .split('')
      .filter((letter) => letters.includes(letter))
      .slice(0, 2)
      .join('') || 'pa'
  const avatar = createAvatar(initials, {
    seed,
    backgroundColor,
    fontFamily: ['IBM Plex Sans']
  })
  const svgBuffer = await avatar.toArrayBuffer()
  const pngBuffer = await sharp(svgBuffer).png().toBuffer()
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(pngBuffer, userId, 'png')
  return publicLocation
}
