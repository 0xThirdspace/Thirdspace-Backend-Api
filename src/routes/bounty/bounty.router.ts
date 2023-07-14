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
    const bounty = await BountyService.deleteBounty(userId, bountyId);
    if (!bounty) {
      return res.status(404).json({ message: 'Bounty not found.' });
    }
    res.status(200).json({ message: 'Bounty deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});


// DELETE / - Delete all bounties created by the user
router.delete('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
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


export default router;


