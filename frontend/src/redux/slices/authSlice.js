import { createSlice } from "@reduxjs/toolkit"

const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name:"auth",
  initialState,
  reducers:{
    setUser:(state, action) => {
      state.user = action.payload;
       localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logoutUser:(state) => {
      state.user = null;
      localStorage.removeItem("user");
    }
  }
})

export const {setUser, logoutUser} = authSlice.actions;
export default authSlice.reducer;