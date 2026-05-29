import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://expensessplitter-project.onrender.com/api' : 'http://localhost:5000/api');
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
