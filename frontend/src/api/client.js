import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  clients: {
    list: (search) => client.get('/clients', { params: { search } }),
    get: (id) => client.get(`/clients/${id}`),
    create: (data) => client.post('/clients', data),
    update: (id, data) => client.put(`/clients/${id}`, data),
    delete: (id) => client.delete(`/clients/${id}`),
  },

  designs: {
    list: (search) => client.get('/designs', { params: { search } }),
    get: (id) => client.get(`/designs/${id}`),
    create: (data) => client.post('/designs', data),
    update: (id, data) => client.put(`/designs/${id}`, data),
    delete: (id) => client.delete(`/designs/${id}`),
  },

  machines: {
    list: (search) => client.get('/machines', { params: { search } }),
    get: (id) => client.get(`/machines/${id}`),
    create: (data) => client.post('/machines', data),
    update: (id, data) => client.put(`/machines/${id}`, data),
    updateRotations: (id, rotations) => client.put(`/machines/${id}/rotations`, { rotations }),
    delete: (id) => client.delete(`/machines/${id}`),
  },

  operators: {
    list: (search) => client.get('/operators', { params: { search } }),
    get: (id) => client.get(`/operators/${id}`),
    create: (data) => client.post('/operators', data),
    update: (id, data) => client.put(`/operators/${id}`, data),
    delete: (id) => client.delete(`/operators/${id}`),
  },

  lots: {
    list: (params) => client.get('/lots', { params }),
    get: (id) => client.get(`/lots/${id}`),
    create: (data) => client.post('/lots', data),
    update: (id, data) => client.put(`/lots/${id}`, data),
    delete: (id) => client.delete(`/lots/${id}`),
  },

  sublots: {
    list: (params) => client.get('/sublots', { params }),
    get: (id) => client.get(`/sublots/${id}`),
    updateState: (id, state) => client.put(`/sublots/${id}/state`, { state }),
    getHistory: (id) => client.get(`/sublots/${id}/history`),
    delete: (id) => client.delete(`/sublots/${id}`),
  },

  assignments: {
    list: (params) => client.get('/assignments', { params }),
    get: (id) => client.get(`/assignments/${id}`),
    getActiveForMachine: (machineId) => client.get(`/assignments/machine/${machineId}/active`),
    create: (data) => client.post('/assignments', data),
    updateProgress: (id, piecesCompleted) =>
      client.put(`/assignments/${id}/progress`, { piecesCompleted }),
    complete: (id) => client.put(`/assignments/${id}/complete`),
    delete: (id) => client.delete(`/assignments/${id}`),
  },

  shiftLogs: {
    list: (params) => client.get('/shiftlogs', { params }),
    get: (id) => client.get(`/shiftlogs/${id}`),
    create: (data) => client.post('/shiftlogs', data),
    getPreviousRunning: (params) => client.get('/shiftlogs/previous-running', { params }),
    getDailyProduction: (date) => client.get('/shiftlogs/daily-production', { params: { date } }),
    getSalaryReport: (operatorId, fromDate, toDate) =>
      client.get(`/shiftlogs/salary-report/${operatorId}`, { params: { fromDate, toDate } }),
    delete: (id) => client.delete(`/shiftlogs/${id}`),
  },
};

export default client;
