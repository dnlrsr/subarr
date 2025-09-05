import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';

export class SettingsController {
    private databaseService: DatabaseService;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
    }

    public getSettings = (req: Request, res: Response): void => {
        try {
            const settings = this.databaseService.getSettingsAsObject();
            res.json(settings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Failed to fetch settings' });
        }
    };

    public updateSettings = (req: Request, res: Response): void => {
        try {
            const settings = req.body;
            this.databaseService.insertSettings(settings);
            res.json({ success: true });
        } catch (error) {
            console.error('Failed to update settings:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    };
}
