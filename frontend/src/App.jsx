import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Chat from "./pages/Chat"
import { useDispatch, useSelector } from "react-redux"
import { useGetMeQuery } from "./redux/api/authApi"
import { logoutUser, setUser } from "./redux/slices/authSlice"
import { useEffect } from "react"
import PublicRoute from "./components/PublicRoute"
import ProtectedRoute from "./components/ProtectedRoute"
import { socket } from './socket';
import SearchedUsers from "./pages/SearchedUsers"

const App = () => {
  const dispatch = useDispatch();
   const {user} = useSelector((state)=>state.auth)

    const {
    data,
    error,
    isLoading,
  } = useGetMeQuery();

  // console.log({ data, error, isLoading, isError });

   useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

   useEffect(() => {
    if (error) {
      dispatch(logoutUser());
    }
  }, [error, dispatch]);

   useEffect(() => {
  if (user?._id) {
    socket.connect();
    socket.emit("addUser", user._id);
  }

  return () => {
    socket.disconnect();
  };
}, [user]);

   if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Routes> 
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected route */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />


      {/* Protected route */}
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchedUsers />
          </ProtectedRoute>
        }
      />

      {/* Default route */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
    </Routes>
  )
}
export default App