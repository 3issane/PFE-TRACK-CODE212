import { apiRequest, apiRequestPublic } from './api';

const eventApi = {
  // Get all events for the current user
  getEvents: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.includePublic !== undefined) queryParams.append('includePublic', params.includePublic);
    
    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Use apiRequestPublic for requests that include public events to avoid authentication issues
    if (params.includePublic) {
      return apiRequestPublic(url);
    }
    
    return apiRequest(url);
  },

  // Get upcoming events
  getUpcomingEvents: async (limit = 10) => {
    return apiRequest(`/events/upcoming?limit=${limit}`);
  },

  // Get events for a specific date
  getEventsByDate: async (date) => {
    return apiRequest(`/events/date/${date}`);
  },

  // Get a specific event by ID
  getEvent: async (id) => {
    return apiRequest(`/events/${id}`);
  },

  // Create a new event
  createEvent: async (eventData) => {
    return apiRequest('/events', { method: 'POST', body: JSON.stringify(eventData) });
  },

  // Update an existing event
  updateEvent: async (id, eventData) => {
    return apiRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) });
  },

  // Delete an event
  deleteEvent: async (id) => {
    return apiRequest(`/events/${id}`, { method: 'DELETE' });
  },

  // Get event statistics
  getEventStats: async () => {
    return apiRequest('/events/stats');
  }
};

export default eventApi;