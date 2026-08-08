import API from './api';

const getGroups = async () => {
  const response = await API.get('/groups');
  return response.data;
};

const createGroup = async (groupData) => {
  const response = await API.post('/groups', groupData);
  return response.data;
};

const getGroupDetails = async (id) => {
  const response = await API.get(`/groups/${id}`);
  return response.data;
};

const joinGroup = async (id) => {
  const response = await API.post(`/groups/${id}/join`);
  return response.data;
};

const leaveGroup = async (id) => {
  const response = await API.post(`/groups/${id}/leave`);
  return response.data;
};

const sendNudge = async (groupId, recipientId) => {
  const response = await API.post(`/groups/${groupId}/interactions/nudge`, { recipientId });
  return response.data;
};

const sendHighFive = async (groupId, recipientId) => {
  const response = await API.post(`/groups/${groupId}/interactions/highfive`, { recipientId });
  return response.data;
};

const groupService = {
  getGroups,
  createGroup,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  sendNudge,
  sendHighFive,
};

export default groupService;
