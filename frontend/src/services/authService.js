import API from './api';

const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const login = async (userData) => {
  const response = await API.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await API.put('/users/profile', profileData);
  return response.data;
};

const getStats = async () => {
  const response = await API.get('/users/stats');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  getStats,
};

export default authService;
