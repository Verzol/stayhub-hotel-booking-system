/**
 * Parallel Processing Utilities
 * Functions for executing operations in parallel
 */

/**
 * Execute multiple async functions in parallel with concurrency limit
 */
export async function parallelMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { concurrency = 5, onProgress } = options;
  const results: R[] = [];
  const errors: Error[] = [];

  // Process in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((item, batchIndex) => mapper(item, i + batchIndex))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results[i + index] = result.value;
      } else {
        errors.push(result.reason);
        results[i + index] = null as any; // Placeholder for failed items
      }
    });

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + batch.length, items.length), items.length);
    }
  }

  if (errors.length > 0) {
    console.warn(`${errors.length} items failed in parallelMap:`, errors);
  }

  return results;
}

/**
 * Execute multiple async functions in parallel, return results and errors separately
 */
export async function parallelSettled<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<{
  results: R[];
  errors: Array<{ item: T; error: Error }>;
}> {
  const results: R[] = [];
  const errors: Array<{ item: T; error: Error }> = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((item) => mapper(item))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push({
          item: batch[index],
          error:
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
        });
      }
    });
  }

  return { results, errors };
}

/**
 * Batch API calls with retry logic
 */
export async function batchApiCalls<T, R>(
  items: T[],
  apiCall: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    maxRetries?: number;
    retryDelay?: number;
    onBatchComplete?: (batchIndex: number, totalBatches: number) => void;
  } = {}
): Promise<R[]> {
  const {
    batchSize = 5,
    maxRetries = 3,
    retryDelay = 1000,
    onBatchComplete,
  } = options;

  const results: R[] = [];
  const totalBatches = Math.ceil(items.length / batchSize);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batch = items.slice(
      batchIndex * batchSize,
      (batchIndex + 1) * batchSize
    );

    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await apiCall(item);
          } catch (error) {
            lastError =
              error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries - 1) {
              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * (attempt + 1))
              );
            }
          }
        }

        throw lastError || new Error('Unknown error');
      })
    );

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch API call failed:', result.reason);
        // Push null or handle error as needed
        results.push(null as any);
      }
    });

    if (onBatchComplete) {
      onBatchComplete(batchIndex + 1, totalBatches);
    }
  }

  return results;
}

/**
 * Execute tasks with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Create a debounced version of a function that can be called multiple times
 * Only the last call will be executed after the delay
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Create a throttled version of a function
 * Function will be called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= interval) {
      lastCall = now;
      func(...args);
    } else {
      // Schedule call after remaining time
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
        timeoutId = null;
      }, interval - timeSinceLastCall);
    }
  };
}

/**
 * Create a queue for processing tasks sequentially
 */
export class TaskQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrency: number;
  private running = 0;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing || this.running >= this.concurrency) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.running < this.concurrency) {
      const task = this.queue.shift();
      if (task) {
        this.running++;
        task().finally(() => {
          this.running--;
          if (this.queue.length > 0) {
            this.process();
          } else {
            this.processing = false;
          }
        });
      }
    }

    this.processing = false;
  }

  get length(): number {
    return this.queue.length;
  }

  get isProcessing(): boolean {
    return this.processing || this.running > 0;
  }
}
