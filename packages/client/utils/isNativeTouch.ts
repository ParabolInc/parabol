const isNativeTouch = (e: MouseEvent | TouchEvent): e is TouchEvent => {
  return (e as any).touches !== undefined
}

export default isNativeTouch
