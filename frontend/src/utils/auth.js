export const getLocalUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (err) {
    localStorage.removeItem("user");
    return null;
  }
};