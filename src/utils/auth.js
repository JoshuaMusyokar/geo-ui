// Store the JWT token
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Retrieve the JWT token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Remove the token on logout
export const removeToken = () => {
  localStorage.removeItem("token");
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  return !!getToken(); // Returns true if token exists
};
