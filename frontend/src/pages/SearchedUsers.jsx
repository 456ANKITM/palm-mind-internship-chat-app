import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "../components/LoggedInNavbar"
import { useSearchUsersQuery } from "../redux/api/authApi";
import { MessageSquare } from "lucide-react";
import { useCreateConversationMutation } from "../redux/api/conversationApi";

const SearchedUsers = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get("query") || ""

    const {data, isLoading, error} = useSearchUsersQuery({query},{skip:!query})
    const [createConversation] = useCreateConversationMutation();
    const users = data?.users;
    
    const handleMessage = async (receiverId) => {
  try {
    
    const res = await createConversation({
      receiverId,
    }).unwrap();

    console.log(res);

    navigate(`/chat?conversation=${res.conversation._id}`);
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-4">
        
        {/* Header */}
        <h1 className="text-lg font-semibold mb-4">
          Search Results for:{" "}
          <span className="text-gray-500">{query}</span>
        </h1>

        {/* Loading */}
        {isLoading && (
          <p className="text-gray-500">Searching users...</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500">
            Failed to load users
          </p>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {users?.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border hover:shadow-md transition"
            >
              
              {/* Left side */}
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.profileImage ||
                    "https://via.placeholder.com/40"
                  }
                  className="w-11 h-11 rounded-full object-cover border"
                />

                <div>
                  <p className="font-medium text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Message Button */}
              <button
  onClick={() => handleMessage(user._id)}
  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition"
>
  <MessageSquare size={16} />
  Message
</button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && users.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            No users found
          </div>
        )}
      </div>
    </div>
  )
}
export default SearchedUsers