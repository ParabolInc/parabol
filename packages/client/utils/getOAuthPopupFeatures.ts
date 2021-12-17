interface Box {
  width: number
  height: number
  top: number
}

const getOAuthPopupFeatures = ({width, height, top}: Box) => {
  const {outerWidth, innerWidth, outerHeight, innerHeight, screenX, screenY} = window
  const startX = screenX + (outerWidth - innerWidth) / 2
  const startY = screenY + (outerHeight - innerHeight) / 2
  const left = Math.round(startX + (innerWidth - width) / 2)
  // 64 is the Parabol header
  const topOff = Math.round(startY + (innerHeight - height) / 2 + top)
  return `popup,width=${width},height=${height},left=${left},top=${topOff}`
}

export default getOAuthPopupFeatures
