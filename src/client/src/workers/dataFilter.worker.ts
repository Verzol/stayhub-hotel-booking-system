/**
 * Web Worker for data filtering and sorting
 * Handles heavy filtering operations without blocking the main thread
 */

interface FilterTask {
  data: any[];
  filters: {
    searchTerm?: string;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

interface SortTask {
  data: any[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchTask {
  items: any[];
  searchTerm: string;
  searchFields: string[];
}

self.onmessage = function (
  event: MessageEvent<{
    taskId: string;
    type: 'filter' | 'sort' | 'search';
    payload: FilterTask | SortTask | SearchTask;
  }>
) {
  const { taskId, type, payload } = event.data;

  try {
    let result: any;

    switch (type) {
      case 'filter':
        result = handleFilter(payload as FilterTask);
        break;
      case 'sort':
        result = handleSort(payload as SortTask);
        break;
      case 'search':
        result = handleSearch(payload as SearchTask);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({ taskId, result });
  } catch (error) {
    self.postMessage({
      taskId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

function handleFilter(task: FilterTask): any[] {
  const { data, filters } = task;
  let filtered = [...data];

  // Search term filtering
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((item) => {
      // Search in all string fields
      return Object.values(item).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }

  // Apply custom filters
  if (filters.filters) {
    Object.entries(filters.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];

          // Handle array filters (e.g., amenities)
          if (Array.isArray(value)) {
            return value.every((v) => {
              if (Array.isArray(itemValue)) {
                return itemValue.includes(v);
              }
              return itemValue === v;
            });
          }

          // Handle range filters (e.g., price range)
          if (typeof value === 'object' && 'min' in value && 'max' in value) {
            return itemValue >= value.min && itemValue <= value.max;
          }

          // Handle equality filters
          return itemValue === value;
        });
      }
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy!];
      const bVal = b[filters.sortBy!];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
}

function handleSort(task: SortTask): any[] {
  const { data, sortBy, sortOrder } = task;
  const sorted = [...data];

  sorted.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle different types
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    // Fallback comparison
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

function handleSearch(task: SearchTask): any[] {
  const { items, searchTerm, searchFields } = task;
  const searchLower = searchTerm.toLowerCase();

  return items.filter((item) => {
    return searchFields.some((field) => {
      const value = getNestedValue(item, field);
      if (value == null) return false;

      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }

      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }

      return false;
    });
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}
