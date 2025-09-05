import { Request, Response } from 'express';
import { MetaProvider } from '../utils';

export class MetaController {
    private metaProvider: MetaProvider;

    constructor() {
        this.metaProvider = new MetaProvider();
    }

    public getMeta = (req: Request, res: Response): void => {
        try {
            const meta = this.metaProvider.getMeta();
            res.json(meta);
        } catch (error) {
            console.error('Error fetching meta:', error);
            res.status(500).json({ error: 'Failed to fetch meta information' });
        }
    };
}
