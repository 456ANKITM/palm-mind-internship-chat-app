import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const messageApi = createApi({
    reducerPath:"messageApi",
    baseQuery: fetchBaseQuery({
        baseUrl:`${import.meta.env.VITE_BACKEND_URL}/api/message`,
        credentials:'include'
    }),
    tagTypes: ["UnreadMessages"],
    endpoints: (builder) => ({
        getAllMessagesOfConversation: builder.query({
            query:({conversationId})=> ({
                url:`/${conversationId}`
            })
        }),
        sendMessage: builder.mutation({
            query: (data) => ({
                url:"/sendMessage",
                method:'POST',
                body:data
            }),
            // Invalidate so the sender's unread count stays fresh
            // (e.g. if the other side marks as seen server-side)
            invalidatesTags: ["UnreadMessages"],
        }),
        getUnreadMessagesCount: builder.query({
            query:() => ({
                url:"/unread-count"
            }),
            providesTags: ["UnreadMessages"],
        }),
        markMessagesAsSeen: builder.mutation({
            query:({conversationId}) => ({
                url:`/seen/${conversationId}`,
                method:'PUT'
            }),
            invalidatesTags: ["UnreadMessages"],
        })
    })
})

export const {
    useGetAllMessagesOfConversationQuery,
    useSendMessageMutation,
    useGetUnreadMessagesCountQuery,
    useMarkMessagesAsSeenMutation
} = messageApi;