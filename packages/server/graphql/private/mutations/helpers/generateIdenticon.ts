import sharp from 'sharp'
import {initials as getInitials} from '../../../../../client/shared/initials'
import {selectThemeBackgroundColor} from '../../../../../client/shared/selectThemeBackgroundColor'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'

export const generateIdenticon = async (userId: string, name: string) => {
  const initials = getInitials(name, 'pa')
  const backgroundColor = selectThemeBackgroundColor(initials)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#${backgroundColor}"/><text x="50" y="50" dy="17.8" font-family="IBM Plex Sans" font-size="50" font-weight="400" fill="#fff" text-anchor="middle">${initials}</text></svg>`
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(pngBuffer, userId, 'png')
  return publicLocation
}
