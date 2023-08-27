import { Router, Request, Response, NextFunction } from 'express';
import authenticateToken from '../../middleware/isAuth';
import MessageService from './message.service';
import { upload } from '../../middleware/cloudinary';

const messageRouter = Router();

// POST /createMessage - Create a new message
messageRouter.post('/createMessage', authenticateToken, upload.any(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if req.files is defined and not empty
    if (req.files && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const image = files[0];
      const imageUrl = image.path;

      const { chatId, senderId, text } = req.body;

      // Create the message with the imageUrl
      const createdMessage = await MessageService.createMessage(chatId, senderId, text, imageUrl);

      // Return the created message to the client
      return res.status(201).json(createdMessage);
    } else {
      // Handle the case where no files were uploaded (imageUrl is not available)
      const { chatId, senderId, text } = req.body;

      // Create the message without imageUrl
      const createdMessage = await MessageService.createMessage(chatId, senderId, text);

      // Return the created message to the client
      return res.status(201).json(createdMessage);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /getMessages/:chatId - Get messages for a specific chat
messageRouter.get('/getMessages/:chatId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;

    // Retrieve messages for the specified chat
    const messages = await MessageService.getMessagesByChatId(chatId);

    // Return the messages to the client
    return res.status(200).json(messages);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
// PUT /editMessage/:messageId - Edit a specific message by its ID
messageRouter.put('/editMessage/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const messageId = req.params.messageId;
    const { text } = req.body;

    
    const editedMessage = await MessageService.editMessage(messageId, text);

    // Return the edited message to the client
    return res.status(200).json(editedMessage);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /deleteMessage/:messageId - Delete a specific message by its ID
messageRouter.delete('/deleteMessage/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const messageId = req.params.messageId;

  
    await MessageService.deleteMessage(messageId);

    // Return a success message to the client
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /deleteAllMessages/:chatId - Delete all messages and associated chat by chat ID
messageRouter.delete('/deleteAllMessages/:chatId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;

    // Call a method in your MessageService to delete all messages and chat by chat ID
    // You should implement this method in your MessageService class
    await MessageService.deleteAllMessagesAndChat(chatId);

    // Return a success message to the client
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default messageRouter;
