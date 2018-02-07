export default function makeAllTasks(teamOrMembers) {
  const taskIds = new Set();
  const allTasks = [];
  for (let i = 0; i < teamOrMembers.length; i++) {
    const {tasks} = teamOrMembers[i];
    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j];
      if (!taskIds.has(task.id)) {
        taskIds.add(task.id);
        allTasks.push(tasks[j]);
      }
    }
  }
  return allTasks;
}
