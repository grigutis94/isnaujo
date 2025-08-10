// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Storage for auth token
let authToken = localStorage.getItem('authToken');

// HTTP client with auth headers
const apiClient = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    },

    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },

    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }
};

// Auth API functions
const authAPI = {
    async register(userData) {
        const response = await apiClient.post('/auth/register', userData);
        if (response.token) {
            authToken = response.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userSession', JSON.stringify(response.user));
        }
        return response;
    },

    async login(credentials) {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.token) {
            authToken = response.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userSession', JSON.stringify(response.user));
        }
        return response;
    },

    async logout() {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            authToken = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('userSession');
            localStorage.removeItem('currentProject');
            localStorage.removeItem('userProjects');
        }
    },

    async getCurrentUser() {
        return await apiClient.get('/auth/me');
    },

    isAuthenticated() {
        return !!authToken;
    }
};

// Projects API functions
const projectsAPI = {
    async getProjects() {
        return await apiClient.get('/projects');
    },

    async createProject(projectData) {
        return await apiClient.post('/projects', projectData);
    },

    async getProject(projectId) {
        return await apiClient.get(`/projects/${projectId}`);
    },

    async updateProject(projectId, projectData) {
        return await apiClient.put(`/projects/${projectId}`, projectData);
    },

    async deleteProject(projectId) {
        return await apiClient.delete(`/projects/${projectId}`);
    },

    async duplicateProject(projectId, newName) {
        return await apiClient.post(`/projects/${projectId}/duplicate`, { name: newName });
    }
};

// Make APIs available globally
window.authAPI = authAPI;
window.projectsAPI = projectsAPI;