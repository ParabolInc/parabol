import {createAvatar} from '@dicebear/core'
import * as initials from '@dicebear/initials'
import sharp from 'sharp'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'

export const generateIdenticon = async (userId: string, name: string) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  // 500 color value from our theme
  const backgroundColor = [
    'FD6157',
    'D35D22',
    'DE8E02',
    'ACC125',
    '639442',
    '40B574',
    '33B1C7',
    '329AE5',
    '7272E5',
    'A06BD6',
    'D345CF',
    'ED4C86',
    'A7A3C2'
  ]

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
