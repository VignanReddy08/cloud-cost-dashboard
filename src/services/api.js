const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    verifyConnection: async (credentials) => {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Verification failed');
        }
        return response.json();
    },

    getCostData: async (credentials) => {
        const response = await fetch('/api/cost', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...credentials, days: 14 }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch cost data');
        }
        return response.json();
    },

    getBudgets: async (credentials) => {
        const response = await fetch('/api/budgets', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch budgets');
        }
        return response.json();
    },

    getRecommendations: async (credentials) => {
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch recommendations');
        }
        return response.json();
    }
};
