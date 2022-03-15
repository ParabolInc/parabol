
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
  const {UI_AUTH_FULLSCREEN} = window.__ACTION__

  if (UI_AUTH_FULLSCREEN)
  {
    return `popup,width=${outerWidth},height=${outerHeight},left=${left},top=${topOff}`
  }
  return `popup,width=${width},height=${height},left=${left},top=${topOff}`
}

export default getOAuthPopupFeatures
