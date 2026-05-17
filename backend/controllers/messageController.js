import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const {conversationId, text} = req.body;

        if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

      if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isMember = conversation.members.some(
        (member) => member.toString() === senderId.toString()
    )

      if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

       const message = await Message.create({
      conversationId,
      senderId,
      text,
      seenBy: [senderId],
    });

    const unreadUsers = conversation.members.filter(
        (member) => member.toString() !== senderId.toString()
    );

    conversation.lastMessage = {
        text,
        senderId,
        createdAt: message.createdAt
    }

    conversation.unreadBy = unreadUsers;

    conversation.updatedAt = new Date();

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
    .populate("senderId", "name email profileImage")

    return res.status(201).json({
        success:true,
        message:populatedMessage
    })
        
    } catch (error) {
         return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
    }
}

export const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const {conversationId} = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isMember = conversation.members.some(
        (member) => member.toString() === userId.toString()
    )

    if(!isMember) {
        return res.status(403).json({
            success:false,
            message:"Unauthorized access"
        })
    }

    const messages = await Message.find({conversationId})
    .populate("senderId", "name profileImage")

    conversation.unreadBy = conversation.unreadBy.filter(
        (id) => id.toString() !== userId.toString()
    )

    await conversation.save()

    return res.status(200).json({
        success: true, 
        messages
    })

        
    } catch (error) {
        return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    }
)}
}

export const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get all conversations where user is a member
    const conversations = await Conversation.find({
      members: userId,
    }).select("_id");

    const conversationIds = conversations.map((c) =>
      c._id.toString()
    );

    // 2. Get unread messages ONLY from those conversations
    const unreadMessages = await Message.find({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      seenBy: { $ne: userId },
    });

    const totalUnreadCount = unreadMessages.length;

    // 3. Count per conversation
    const conversationCounts = {};

    unreadMessages.forEach((message) => {
      const conversationId = message.conversationId.toString();

      if (!conversationCounts[conversationId]) {
        conversationCounts[conversationId] = 0;
      }

      conversationCounts[conversationId]++;
    });

    return res.status(200).json({
      success: true,
      totalUnreadCount,
      conversationCounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const {conversationId} = req.params;

    const conversation = await Conversation.findById(conversationId);
    if(!conversation) {
      return res.status(404).json({
        success:false, 
        message:"Conversation not found"
      })
    }

    const isMember = conversation.members.some(
      (member) => member.toString() === userId.toString()
    )

    if(!isMember) {
      return res.status(403).json({
        success:false, 
        message:"Unauthroized"
      })
    }

    await Message.updateMany({
      conversationId, 
      senderId: {$ne: userId},
      seenBy: {$ne: userId}
    },{
      $push : {
        seenBy: userId
      }
    })

    conversation.unreadBy = conversation.unreadBy.filter((id)=>id.toString() !== userId.toString())

    await conversation.save();

    return res.status(200).json({
      success:true, 
      message:"messages marked as seen"
    })
    
  } catch (error) {
     return res.status(500).json({
      success:false, 
      message:"Server Error",
      error:error.message
    })
  }
}