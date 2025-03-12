export const addTask = (tasks: any[], newTask: string) => {
    return [
      ...tasks,
      { id: Date.now().toString(), text: newTask, priority: 'Medium' },
    ];
};
  
export const removeTask = (tasks: any[], taskId: string) => {
    return tasks.filter(task => task.id !== taskId);
};
  