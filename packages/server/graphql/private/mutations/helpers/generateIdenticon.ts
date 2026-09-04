import {createAvatar} from '@dicebear/core'
import * as initials from '@dicebear/initials'
import sharp from 'sharp'
import {initials as getInitials} from '../../../../../client/shared/initials'
import {themeBackgroundColors} from '../../../../../client/shared/themeBackgroundColors'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'
export const generateIdenticon = async (userId: string, name: string) => {
  const seed = getInitials(name, 'pa').toLowerCase()
  const avatar = createAvatar(initials, {
    seed,
    // 500 color value from our theme
    backgroundColor: themeBackgroundColors,
    fontFamily: ['IBM Plex Sans']
  })
  const svgBuffer = Buffer.from(avatar.toString())
  const pngBuffer = await sharp(svgBuffer).png().toBuffer()
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(pngBuffer, userId, 'png')
  return publicLocation
}
