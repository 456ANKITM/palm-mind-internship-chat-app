import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery: fetchBaseQuery({
        baseUrl:`${import.meta.env.VITE_BACKEND_URL}/api/auth`,
        credentials:'include'
    }),
    endpoints: (builder) => ({
      signup: builder.mutation({
        query:(data) => ({
            url:"/signup",
            method:"POST",
            body:data
        })
      }),
      login: builder.mutation({
        query:(data) => ({
          url:"/login",
          method:"POST",
          body:data
        })
      }),
      getMe: builder.query({
        query: () => ({
          url:"/getMe"
        })
      }),
      searchUsers: builder.query({
        query:({query}) => ({
          url:`/search?query=${query}`
        })
      }),
      logout: builder.mutation({
        query:() => ({
          url:"/logout",
          method:"POST"
        })
      })
    })
})

export const {useSignupMutation, useLoginMutation, useGetMeQuery, useSearchUsersQuery, useLogoutMutation} = authApi;