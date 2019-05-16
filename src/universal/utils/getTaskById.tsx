interface Task {
  id: string
}

const getTaskById = <T extends Task>(taskArr: ReadonlyArray<T>) => (
  taskId: string
): T | undefined | null => {
  if (!taskArr) return undefined
  return taskArr.find((task) => task.id === taskId)
}

export default getTaskById
