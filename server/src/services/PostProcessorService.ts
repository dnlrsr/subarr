import { PostProcessorContext, ProcessConfig, WebhookConfig } from '../models/types';
import { HttpClient, ProcessRunner } from '../utils';

export class PostProcessorService {
    private httpClient: HttpClient;
    private processRunner: ProcessRunner;

    constructor() {
        this.httpClient = new HttpClient();
        this.processRunner = new ProcessRunner();
    }

    public async runPostProcessor(
        type: 'webhook' | 'process',
        target: string,
        data: string,
        context?: PostProcessorContext
    ): Promise<string> {
        if (type === 'webhook') {
            return this.runWebhookProcessor(target, data, context);
        } else if (type === 'process') {
            return this.runProcessProcessor(target, data, context);
        } else {
            throw new Error(`Unknown processor type: ${type}`);
        }
    }

    private async runWebhookProcessor(
        target: string,
        data: string,
        context?: PostProcessorContext
    ): Promise<string> {
        const { method = 'POST', headers = {}, body }: WebhookConfig = JSON.parse(data);

        const processedTarget = this.replaceVariables(target, context, true);
        const processedBody = this.replaceVariables(body || '', context);

        const response = await this.httpClient.fetchWithRetry(processedTarget, {
            method,
            headers,
            body: processedBody || undefined,
        });

        const text = await response.text();
        if (!response.ok) {
            throw new Error(text);
        }

        return text;
    }

    private async runProcessProcessor(
        target: string,
        data: string,
        context?: PostProcessorContext
    ): Promise<string> {
        const { args }: ProcessConfig = JSON.parse(data);
        const processedArgs = this.replaceVariables(args, context);

        return await this.processRunner.runCommand(target, processedArgs);
    }

    private replaceVariables(
        text: string,
        context?: PostProcessorContext,
        urlsafe = false
    ): string {
        const example = {
            video: {
                title: 'Example Video',
                video_id: 'dQw4w9WgXcQ',
                thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                published_at: new Date().toISOString(),
            },
            playlist: {
                title: 'Example Playlist'
            }
        };

        const data = context || example;

        const replacements: Record<string, string> = {
            '[[video.title]]': data.video.title,
            '[[video.thumbnail]]': data.video.thumbnail || '',
            '[[video.video_id]]': data.video.video_id,
            '[[video.published_at]]': data.video.published_at || '',
            '[[playlist.title]]': data.playlist.title,
        };

        let result = text;
        for (const [key, value] of Object.entries(replacements)) {
            let replacement = value;
            if (urlsafe) {
                replacement = encodeURIComponent(value);
            } else {
                // Escape properly for JSON strings
                replacement = JSON.stringify(value).slice(1, -1); // slice removes surrounding quotes
            }
            result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
        }

        return result;
    }
}
