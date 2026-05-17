import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const conversationApi = createApi({
    reducerPath:"conversationApi",
    baseQuery: fetchBaseQuery({
        baseUrl:`${import.meta.env.VITE_BACKEND_URL}/api/conversation`,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        getUserConversations: builder.query({
            query:()=> ({
                url:"/getUserConversations"
            })
        }),

        createConversation: builder.mutation({
            query:(data) => ({
                url:"/createConversation",
                method:"POST",
                body:data
            })
        })
    
    })
})

export const {useGetUserConversationsQuery, useCreateConversationMutation} = conversationApi;