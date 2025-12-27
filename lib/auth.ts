export const loginUser = () => {
  localStorage.setItem("loggedIn", "true");
};

export const logoutUser = () => {
  localStorage.removeItem("loggedIn");
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("loggedIn") === "true";
};
