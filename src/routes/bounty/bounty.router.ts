import  { Router, Request, Response, NextFunction } from 'express';
import authenticateToken from '../../middleware/isAuth';
import BountyService from './bounty.service';


const router = Router();

// POST / - Create a new bounty
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, repo_link, amount, start_date, end_date, bounty_description } = req.body;
    const userId = (req as any).userId;
    const workspaceId = req.body.workspaceId;

    if (!title || !repo_link || !amount || !start_date || !end_date || !bounty_description) {
      throw new Error("All fields must be provided"); 
    }

    const bounty = await BountyService.createBounty(
      userId,
      workspaceId,
      title,
      repo_link,
      amount,
      start_date,
      end_date,
      bounty_description
    );
    res.status(201).json(bounty);
  }  catch (error: any) {
    return res.status(500).json(error.message);
  }
});

// GET / - Get all bounties
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bounties = await BountyService.getAllBounties();
    res.status(200).json(bounties);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

// GET /created - Get bounties created by the user
router.get('/created', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bounties = await BountyService.getBountiesCreatedByUser(userId);
    res.status(200).json(bounties);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

// DELETE /:id - Delete a bounty by ID
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bountyId = req.params.id;
    const bounty = await BountyService.getBountyById(bountyId); // Retrieve the bounty by ID

    if (!bounty) {
      return res.status(404).json({ message: 'Bounty not found' });
    }

      // Check if the user has an existing bounty
      const existingBounty = await BountyService.getExistingBounty(userId);
    
      if (!existingBounty) {
        return res.status(404).json({ message: 'You do not have an existing bounty.' });
      }
      
      if (existingBounty.status !== 'closed') {
        return res.status(400).json({ message: 'You can only delete a bounty with a "closed" status.' });
      }
    await BountyService.deleteBounty(userId, bountyId);
    return res.status(200).json({ message: 'Delete successfully' });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});



// DELETE / - Delete all bounties created by the user
router.delete('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Check if the user has an existing bounty
    const existingBounty = await BountyService.getExistingBounty(userId);
    
    if (!existingBounty) {
      return res.status(404).json({ message: 'You do not have an existing bounty.' });
    }
    
    if (existingBounty.status !== 'closed') {
      return res.status(400).json({ message: 'You can only delete a bounty with a "closed" status.' });
    }
    
    await BountyService.deleteAllBountiesCreatedByUser(userId);
    res.status(200).json({ message: 'All bounties deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});


// PUT /:id/status - Update bounty status by ID
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bountyId = req.params.id;
    const { status } = req.body;
    const updatedBounty = await BountyService.updateBountyStatus(userId, bountyId, status);
    if (!updatedBounty) {
      return res.status(404).json({ message: 'Bounty not found.' });
    }
    res.status(200).json(updatedBounty);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

// PUT /:id - Update a bounty by ID
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bountyId = req.params.id;
    const updateObject = req.body;

    const updatedBounty = await BountyService.updateBounty(userId, bountyId, updateObject);

    if (!updatedBounty) {
      return res.status(404).json({ message: 'Bounty not found.' });
    }

    res.status(200).json(updatedBounty);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

router.post('/join/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bountyId = req.params.id;
    const userId = (req as any).userId;

    const bounty = await BountyService.getBountyById(bountyId);

    if (!bounty) {
      return res.status(404).json({ message: 'Bounty not found.' });
    } 
    
    if (bounty.userId === userId) {
      return res.status(403).json({ message: 'You cannot join your own bounty.' });
    }


    const participantExists = await BountyService.isParticipantJoined(bountyId, userId);

    if (participantExists) {
      return res.status(400).json({ message: 'You have already joined this bounty.' });
    }
    await BountyService.addParticipant(bountyId, userId);
    
    res.status(200).json({ message: 'Joined bounty successfully.' });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

// GET /participants/:id - Get all participants of a bounty
router.get('/participants/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bountyId = req.params.id;
    const participants = await BountyService.getAllParticipants(bountyId);
    res.status(200).json(participants);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});




export default router;