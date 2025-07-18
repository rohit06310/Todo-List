import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";
import type { Task, InsertTask, UpdateTask } from "@shared/schema";

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const [newTaskText, setNewTaskText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const { toast } = useToast();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskText("");
      toast({
        title: "Task created",
        description: "Your task has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateTask }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTaskId(null);
      setEditingText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Clear completed tasks mutation
  const clearCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/tasks/completed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Completed tasks cleared",
        description: "All completed tasks have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear completed tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle all tasks mutation
  const toggleAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", "/api/tasks/toggle-all");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle all tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (text) {
      createTaskMutation.mutate({ text, completed: false });
    }
  };

  const handleToggleTask = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { completed: !task.completed },
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (taskId: number) => {
    const text = editingText.trim();
    if (text) {
      updateTaskMutation.mutate({
        id: taskId,
        updates: { text },
      });
    }
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            <ListTodo className="inline mr-3 text-cyan-300" size={48} />
            TaskFlow
          </h1>
          <p className="text-indigo-100 text-lg">Beautiful task management made simple</p>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-indigo-200">
            <span>{totalTasks} Total Tasks</span>
            <span>{completedTasks} Completed</span>
            <span>{remainingTasks} Remaining</span>
          </div>
        </div>

        {/* Main Task Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft p-6 md:p-8 animate-fade-in">
          
          {/* Add Task Form */}
          <div className="mb-8">
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Plus className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              >
                <Plus className="mr-2" size={16} />
                Add Task
              </Button>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl">
              {[
                { key: "all", label: "All Tasks" },
                { key: "active", label: "Active" },
                { key: "completed", label: "Completed" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "ghost"}
                  onClick={() => setFilter(key as FilterType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === key
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ListTodo size={64} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks yet</h3>
                <p className="text-gray-500">Add your first task above to get started!</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="group bg-white border border-gray-200 rounded-xl p-4 shadow-card hover:shadow-lg transition-all duration-200 animate-fade-in"
                >
                  <div className="flex items-center gap-4">
                    {/* Custom Checkbox */}
                    <div className="relative flex-shrink-0">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task)}
                        className="w-6 h-6 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors duration-200 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {editingTaskId === task.id ? (
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleSaveEdit(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(task.id);
                            } else if (e.key === "Escape") {
                              setEditingTaskId(null);
                              setEditingText("");
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          autoFocus
                        />
                      ) : (
                        <p
                          className={`font-medium ${
                            task.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {task.text}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                {remainingTasks} of {totalTasks} tasks remaining
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearCompletedMutation.mutate()}
                  disabled={clearCompletedMutation.isPending || completedTasks === 0}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  Clear Completed
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAllMutation.mutate()}
                  disabled={toggleAllMutation.isPending || totalTasks === 0}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                >
                  Mark All Complete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
