import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../redux/api/authApi";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";

const Login = () => {
   
  const [login, {isLoading}] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({
      email: form.email,
      password: form.password,
    }).unwrap();


    

      if(res.success) {
        toast.success(res.message)
        dispatch(setUser(res.user))
        navigate("/chat")
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to login")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white px-4">

      {/* Background glow */}
      <div className="absolute w-[400px] h-[400px] bg-purple-200 blur-[140px] top-[-120px] left-[-120px] opacity-50" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-200 blur-[140px] bottom-[-120px] right-[-120px] opacity-50" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8">

        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Log in 
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1">
          Login to continue chatting with your friends
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* Forgot password */}
          <div className="flex justify-end">
            <span className="text-xs text-gray-500 hover:text-black cursor-pointer">
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Don’t have an account?{" "}
          <span onClick={()=>navigate("/signup")} className="text-black font-medium cursor-pointer hover:underline">
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;