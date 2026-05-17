import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from "../redux/api/authApi";
import toast from "react-hot-toast";

const Signup = () => {

  const [signup, {isLoading}] = useSignupMutation();

  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({ ...form, profileImage: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password)
      if(form.profileImage) {
        formData.append("profileImage", form.profileImage)
      }
      const res = await signup(formData).unwrap();
      console.log(res)
      if(res.success) {
        toast.success(res.message)
        navigate("/login")
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.message || "Failed to signup")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white via-gray-50 to-white px-4">

      {/* Background glow */}
      <div className="absolute w-100 h-100 bg-purple-200 blur-[140px] -top-30 -left-30 opacity-50" />
      <div className="absolute w-100 h-1000 bg-cyan-200 blur-[140px] -bottom-30 -right-30 opacity-50" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Create your account
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1">
          Join our chat platform and start messaging instantly
        </p>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mt-6">
          <label className="cursor-pointer group">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shadow-sm group-hover:opacity-90 transition">
              {preview ? (
                <img
                  src={preview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">Upload</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Click to upload profile image
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition"
          >
            {isLoading ? "Signing up..." : "sign up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <span onClick={()=>navigate("/login")} className="text-black font-medium cursor-pointer hover:underline">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;