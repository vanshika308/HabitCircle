import API from './api';

const getAllHabits = async () => {
  const response = await API.get('/habits');
  return response.data;
};

const createHabit = async (habitData) => {
  const response = await API.post('/habits', habitData);
  return response.data;
};

const updateHabit = async (id, habitData) => {
  const response = await API.put(`/habits/${id}`, habitData);
  return response.data;
};

const deleteHabit = async (id) => {
  const response = await API.delete(`/habits/${id}`);
  return response.data;
};

const checkinHabit = async (id, checkinData) => {
  const response = await API.post(`/habits/${id}/checkin`, checkinData);
  return response.data;
};

const habitService = {
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkinHabit,
};

export default habitService;
