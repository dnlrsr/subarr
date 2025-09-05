import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';

export class ActivityController {
    private databaseService: DatabaseService;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
    }

    public getActivities = (req: Request, res: Response): void => {
        try {
            const pageSize = 20;
            const totalCountRow = this.databaseService.getActivitiesCount();
            const totalPages = Math.ceil(totalCountRow.count / pageSize);

            const requestedPage = parseInt(req.params.page) || 1;
            const page = Math.min(Math.max(1, requestedPage), totalPages);
            const offset = (page - 1) * pageSize;

            const activities = this.databaseService.getActivities(pageSize, offset);

            res.json({
                page,
                totalPages,
                activities
            });
        } catch (error) {
            console.error('Error fetching activities:', error);
            res.status(500).json({ error: 'Failed to fetch activities' });
        }
    };
}
