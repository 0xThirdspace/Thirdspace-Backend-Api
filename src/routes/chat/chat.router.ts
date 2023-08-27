import { Router, Request, Response,  NextFunction } from 'express';
import authenticateToken from '../../middleware/isAuth';
import ChatService from './chat.service';

const chatRouter = Router();

// POST / - Create or Retrieve a chat between two members
chatRouter.post('/', authenticateToken, async (req: Request, res: Response,next: NextFunction) => {
  try {
    const { firstId, secondId } = req.body;

    // Check if a chat already exists between the two members
    const existingChat = await ChatService.findChatByMembers(firstId, secondId);

    if (existingChat) {
      // A chat exists, return it to the client
      return res.status(200).json(existingChat);
    }

    // Create a new chat between the two members
    const newChat = await ChatService.createChat(firstId, secondId);

    // Return the newly created chat to the client
    return res.status(201).json(newChat);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /user/:userId - Find chats for a specific user
chatRouter.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Find chats for the specified user
      const userChats = await ChatService.findUserChats(userId);
  
      // Return the user's chats to the client
      return res.status(200).json(userChats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /find/:firstId/:secondId - Find a single chat between two specific members
chatRouter.get('/find/:firstId/:secondId', authenticateToken, async (req: Request, res: Response) => {
    try {
      const firstId = req.params.firstId;
      const secondId = req.params.secondId;
  
      // Find a chat between the specified members
      const chat = await ChatService.findChatByMembers(firstId, secondId);
  
      if (chat) {
        // A chat exists, return it to the client
        return res.status(200).json(chat);
      } else {
        // No chat found, return a not found response
        return res.status(404).json({ message: 'Chat not found' });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

export default chatRouter;
