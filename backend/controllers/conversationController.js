import Conversation from "../models/Conversation.js";

export const createConversation = async (req, res) => {
    try {
        const senderId = req.user._id;
        const {receiverId} = req.body;
        if(!receiverId) {
            return res.status(400).json({
                success:false,
                message:"Reciever ID is required"
            })
        }
        let conversation = await Conversation.findOne({
            members: {$all: [senderId, receiverId]}
        })
        if(conversation) {
            return res.status(200).json({
                success:true,
                message:"Conversation already exists",
                conversation
            })
        }
        conversation = await Conversation.create({
            members:[senderId, receiverId],
            lastMessage:{
                text:"",
                senderId: null,
                createdAt:null
            },
            unreadBy:[]
        })

        return res.status(201).json({
            success:true,
            message:"Conversation Created Successfully",
            conversation
        })
        
    } catch (error) {
      return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
    }
}

export const getUserConversations = async (req, res) => {
    console.log("The request is comming")
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({members: userId})
        .populate("members", "name email profileImage")
        .sort({updatedAt: -1})
        return res.status(200).json({
            success:true, 
            conversations
        })
        
    } catch (error) {
      return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
    }
}

export const getConversationById = async (req, res) => {
    try {
        const userId = req.user._id;
        const {conversationId} = req.params;
        
        const conversation = await Conversation.findById(conversationId)
        .populate("members", "name email profileImage")
        .populate("lastMessage.senderId", "name profileImage")

          if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isMember = conversation.members.some(
        (member) => member._id.toString() === userId.toString()
    )

    if(!isMember) {
          return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

      return res.status(200).json({
      success: true,
      conversation,
    });
        
    } catch (error) {
         return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
    }
}