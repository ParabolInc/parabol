const findDropZoneInPath = (path: EventTarget[]) => {
  return path.find((el: any) => {
    return el.hasAttribute && el.hasAttribute('data-dropzone')
  }) as HTMLDivElement | null
}

export default findDropZoneInPath
