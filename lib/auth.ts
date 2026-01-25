import api from "./axios";

// Login user (call backend)
export const loginUser = (data: any) => api.post("/auth/login", data);

// Register user (call backend)
export const registerUser = (data: any) => api.post("/auth/register", data);

// ✅ Check if user is logged in (UI-only flag)
export const isLoggedIn = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isLoggedIn") === "true";
  }
  return false;
};

// ✅ Logout user
export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("isLoggedIn"); // UI flag
    window.location.href = "/login";
  }
};
