/**
 * Web Worker for search filtering
 * Handles complex search operations on large datasets
 */

interface SearchFilterTask {
  hotels: any[];
  filters: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    stars?: number[];
    amenities?: number[];
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

interface FilterResult {
  hotels: any[];
  count: number;
  matchedFields: string[];
}

self.onmessage = function (
  event: MessageEvent<{
    taskId: string;
    type: 'filter';
    payload: SearchFilterTask;
  }>
) {
  const { taskId, type, payload } = event.data;

  try {
    let result: FilterResult;

    switch (type) {
      case 'filter':
        result = handleSearchFilter(payload);
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

function handleSearchFilter(task: SearchFilterTask): FilterResult {
  const { hotels, filters } = task;
  const matchedFields: string[] = [];
  let filtered = [...hotels];

  // Text search query
  if (filters.query) {
    const queryLower = filters.query.toLowerCase();
    filtered = filtered.filter((hotel) => {
      const matches =
        hotel.name?.toLowerCase().includes(queryLower) ||
        hotel.description?.toLowerCase().includes(queryLower) ||
        hotel.city?.toLowerCase().includes(queryLower) ||
        hotel.address?.toLowerCase().includes(queryLower);

      if (matches) {
        matchedFields.push('text');
      }
      return matches;
    });
  }

  // Price filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filtered = filtered.filter((hotel) => {
      const minPrice = hotel.minPrice || 0;
      const matches =
        (filters.minPrice === undefined || minPrice >= filters.minPrice) &&
        (filters.maxPrice === undefined || minPrice <= filters.maxPrice);

      if (matches) {
        matchedFields.push('price');
      }
      return matches;
    });
  }

  // Star rating filter
  if (filters.stars && filters.stars.length > 0) {
    filtered = filtered.filter((hotel) => {
      const matches = filters.stars!.includes(hotel.starRating);
      if (matches) {
        matchedFields.push('stars');
      }
      return matches;
    });
  }

  // Amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    filtered = filtered.filter((hotel) => {
      const hotelAmenityIds = hotel.amenities?.map((a: any) => a.id || a) || [];
      const matches = filters.amenities!.every((amenityId) =>
        hotelAmenityIds.includes(amenityId)
      );
      if (matches) {
        matchedFields.push('amenities');
      }
      return matches;
    });
  }

  // Availability filter (check-in/check-out dates)
  if (filters.checkIn && filters.checkOut) {
    filtered = filtered.filter((hotel) => {
      // Check if hotel has available rooms for the dates
      const hasAvailability = checkRoomAvailability(hotel, filters.guests || 1);
      if (hasAvailability) {
        matchedFields.push('availability');
      }
      return hasAvailability;
    });
  }

  return {
    hotels: filtered,
    count: filtered.length,
    matchedFields: [...new Set(matchedFields)],
  };
}

function checkRoomAvailability(hotel: any, guests: number): boolean {
  // If hotel has rooms array, check availability
  if (hotel.rooms && Array.isArray(hotel.rooms)) {
    return hotel.rooms.some((room: any) => {
      // Check capacity
      if (room.capacity && room.capacity < guests) {
        return false;
      }

      // Check if room is available (simplified - would need actual availability check)
      // This is a placeholder - actual implementation would check room_availability table
      return room.isAvailable !== false;
    });
  }

  // If no rooms data, assume available
  return true;
}
