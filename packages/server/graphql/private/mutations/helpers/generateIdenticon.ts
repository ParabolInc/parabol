import tailwindPreset from '../../../../../client/tailwindTheme'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'

export const generateIdenticon = async (userId: string, name: string) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  // package is ESM only so we must async import as a workaround
  const {initials} = await eval("import('@dicebear/collection')")
  const {createAvatar} = await eval("import('@dicebear/core')")
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
    backgroundColor
  })
  const png = await avatar.png()
  const pngBuffer = await png.toArrayBuffer()
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(pngBuffer, userId, 'png')
  return publicLocation
}
