import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"
import {authApi} from "./api/authApi.js"
import {conversationApi} from "./api/conversationApi.js"
import {messageApi} from "./api/messageApi.js"


export const store = configureStore({
  reducer:{
    [authApi.reducerPath] : authApi.reducer,
    [conversationApi.reducerPath] : conversationApi.reducer,
    [messageApi.reducerPath] : messageApi.reducer,
    auth: authReducer
  },
  middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware).concat(conversationApi.middleware).concat(messageApi.middleware),
})