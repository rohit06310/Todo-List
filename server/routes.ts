import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  // Update a task
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const validatedData = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Clear completed tasks
  app.delete("/api/tasks/completed", async (req, res) => {
    try {
      const count = await storage.clearCompletedTasks();
      res.json({ deletedCount: count });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear completed tasks" });
    }
  });

  // Toggle all tasks completion status
  app.put("/api/tasks/toggle-all", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      const allCompleted = tasks.every(task => task.completed);
      const newCompletedStatus = !allCompleted;

      const updatedTasks = [];
      for (const task of tasks) {
        const updated = await storage.updateTask(task.id, { completed: newCompletedStatus });
        if (updated) {
          updatedTasks.push(updated);
        }
      }

      res.json(updatedTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle all tasks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
