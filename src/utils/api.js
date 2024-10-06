import axios from "axios";

const API_URL = "https://geojuice.onrender.com"; // Replace with your API URL

// Login API call
export const loginUser = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};

// Register API call
export const registerUser = async (data) => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};
export const postJob = async (newJobData, token) => {
  const response = await axios.post(`${API_URL}/jobs`, newJobData);
  return response.data;
};
export const getJobs = async (token) => {
  const response = await axios.get(`${API_URL}/jobs`);

  return response.data; // Assuming your API returns JSON
};
