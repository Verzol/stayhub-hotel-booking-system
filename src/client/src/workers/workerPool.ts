/**
 * Web Worker Pool Manager
 * Manages a pool of Web Workers for parallel processing
 */

interface WorkerTask<T = any> {
  id: string;
  worker: Worker;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    id: string;
    message: any;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private activeTasks: Map<string, WorkerTask> = new Map();
  private maxWorkers: number;
  private workerScript: string;

  constructor(
    workerScript: string,
    maxWorkers: number = navigator.hardwareConcurrency || 4
  ) {
    this.workerScript = workerScript;
    this.maxWorkers = Math.min(maxWorkers, 10); // Cap at 10 workers
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): Worker {
    const worker = new Worker(new URL(this.workerScript, import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event) => {
      const { taskId, result, error } = event.data;
      const task = this.activeTasks.get(taskId);

      if (task) {
        this.activeTasks.delete(taskId);
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(result);
        }
        // Return worker to pool
        this.workers.push(task.worker);
        // Process next task in queue
        this.processQueue();
      }
    };

    worker.onerror = (error: ErrorEvent) => {
      console.error('Worker error:', error);
      // Find and reject the task
      const task = Array.from(this.activeTasks.values()).find(
        (t) => t.worker === error.target
      );
      if (task) {
        this.activeTasks.delete(task.id);
        task.reject(new Error(error.message || 'Worker error'));
      }
      // Remove failed worker and create a new one
      this.workers = this.workers.filter((w) => w !== error.target);
      (error.target as Worker).terminate();
      this.createWorker();
    };

    this.workers.push(worker);
    return worker;
  }

  private processQueue() {
    if (this.queue.length === 0 || this.workers.length === 0) {
      return;
    }

    const task = this.queue.shift()!;
    const worker = this.workers.pop()!;

    const taskId = `${Date.now()}-${Math.random()}`;
    this.activeTasks.set(taskId, {
      id: taskId,
      worker,
      resolve: task.resolve,
      reject: task.reject,
      timestamp: Date.now(),
    });

    worker.postMessage({
      taskId,
      ...task.message,
    });
  }

  /**
   * Execute a task using a worker from the pool
   */
  async execute<T = any>(message: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id: `${Date.now()}-${Math.random()}`,
        message,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  /**
   * Execute multiple tasks in parallel
   */
  async executeParallel<T = any>(
    messages: any[],
    maxConcurrent: number = this.maxWorkers
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: Error[] = [];

    // Process in batches to limit concurrency
    for (let i = 0; i < messages.length; i += maxConcurrent) {
      const batch = messages.slice(i, i + maxConcurrent);
      const batchResults = await Promise.allSettled(
        batch.map((msg) => this.execute<T>(msg))
      );

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push(result.reason);
        }
      });
    }

    if (errors.length > 0) {
      console.warn('Some worker tasks failed:', errors);
    }

    return results;
  }

  /**
   * Terminate all workers
   */
  terminate() {
    // Reject all active tasks
    this.activeTasks.forEach((task) => {
      task.reject(new Error('Worker pool terminated'));
      task.worker.terminate();
    });
    this.activeTasks.clear();

    // Reject all queued tasks
    this.queue.forEach((task) => {
      task.reject(new Error('Worker pool terminated'));
    });
    this.queue = [];

    // Terminate all workers
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
  }

  /**
   * Get pool status
   */
  getStatus() {
    return {
      totalWorkers: this.maxWorkers,
      availableWorkers: this.workers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.queue.length,
    };
  }
}

export default WorkerPool;
