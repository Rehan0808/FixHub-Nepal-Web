const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const dashboardApi = {
  async getStats() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch dashboard data');
    }

    const data = await response.json();
    return data.data;
  },
};
