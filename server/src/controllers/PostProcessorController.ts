import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { PostProcessorService } from '../services/PostProcessorService';

export class PostProcessorController {
    private databaseService: DatabaseService;
    private postProcessorService: PostProcessorService;

    constructor(databaseService: DatabaseService, postProcessorService: PostProcessorService) {
        this.databaseService = databaseService;
        this.postProcessorService = postProcessorService;
    }

    public getPostProcessors = (req: Request, res: Response): void => {
        try {
            const postProcessors = this.databaseService.getPostProcessors();
            res.json(postProcessors);
        } catch (error) {
            console.error('Error fetching post processors:', error);
            res.status(500).json({ error: 'Failed to fetch post processors' });
        }
    };

    public createPostProcessor = (req: Request, res: Response): void => {
        try {
            const { name, type, target, data } = req.body;

            if (!name || !type || !target || !data) {
                res.status(400).json({ error: 'Missing fields' });
                return;
            }

            const result = this.databaseService.insertPostProcessor({ name, type, target, data });
            res.status(201).json({ success: true, id: result.lastInsertRowid });
        } catch (error) {
            console.error('Error creating post processor:', error);
            res.status(500).json({ error: 'Failed to create post processor' });
        }
    };

    public updatePostProcessor = (req: Request, res: Response): void => {
        try {
            const { name, type, target, data } = req.body;

            if (!name || !type || !target || !data) {
                res.status(400).json({ error: 'Missing fields' });
                return;
            }

            const result = this.databaseService.updatePostProcessor(parseInt(req.params.id), { name, type, target, data });

            if (result.changes === 0) {
                res.status(404).json({ error: 'Not found' });
                return;
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating post processor:', error);
            res.status(500).json({ error: 'Failed to update post processor' });
        }
    };

    public deletePostProcessor = (req: Request, res: Response): void => {
        try {
            const result = this.databaseService.deletePostProcessor(parseInt(req.params.id));

            if (result.changes === 0) {
                res.status(404).json({ error: 'Not found' });
                return;
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting post processor:', error);
            res.status(500).json({ error: 'Failed to delete post processor' });
        }
    };

    public testPostProcessor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { type, target, data } = req.body;

            if (!type || !target || !data) {
                res.status(400).json({ error: 'Missing fields' });
                return;
            }

            const response = await this.postProcessorService.runPostProcessor(type, target, data);
            res.json({ success: true, response: `Post processor responded with: ${response}` });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ error: err.message });
        }
    };
}
