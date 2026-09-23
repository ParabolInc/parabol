export const OFFSET_THRESHOLD = 80
export const VELOCITY_THRESHOLD = 500

export const resolveSheetDismiss = (offsetY: number, velocityY: number): boolean =>
  offsetY > OFFSET_THRESHOLD || velocityY > VELOCITY_THRESHOLD
