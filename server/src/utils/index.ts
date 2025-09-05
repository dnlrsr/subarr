import fetch from 'node-fetch';
import { spawn } from 'node:child_process';
import parseArgs from 'string-argv';
import { ChannelInfo } from '../models/types';

export class HttpClient {
    public async fetchWithRetry(url: string, options: any = {}, retries = 3): Promise<any> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fetch(url, options);
            } catch (err) {
                if (attempt === retries - 1) {
                    throw err;
                }
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }
}

export class ProcessRunner {
    public async runCommand(command: string, args: string): Promise<string> {
        console.log(`Launching command '${command}' with args '${args}'`);
        return new Promise((resolve, reject) => {
            const child = spawn(command, parseArgs(args));

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', data => {
                stdout += data.toString();
            });

            child.stderr.on('data', data => {
                stderr += data.toString();
            });

            child.on('close', code => {
                if (code === 0) {
                    resolve(stdout.trim());
                } else {
                    reject(new Error(`Process exited with code ${code}:\n${stderr.trim()}`));
                }
            });

            child.on('error', err => {
                reject(new Error(`Failed to start process: ${err.message}`));
            });
        });
    }
}

export class ChannelInfoParser {
    private httpClient: HttpClient;

    constructor() {
        this.httpClient = new HttpClient();
    }

    public async parseAdditionalChannelData(url: string): Promise<ChannelInfo> {
        const response = await this.httpClient.fetchWithRetry(url);
        const responseText = await response.text();
        const channelFeedMatches = [...responseText.matchAll(/https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=(UC|UU|PL|LL|FL)[\w-]{10,}/g)];

        const channelInfo: ChannelInfo = {};

        if (channelFeedMatches.length > 0 && channelFeedMatches[0][0]) {
            const match = channelFeedMatches[0][0].match(/(UC|UU|PL|LL|FL)[\w-]{10,}/);
            if (match) {
                channelInfo.playlist_id = match[0].replace(/^UC/, 'UU');
            }
        }

        // Parse channel thumbnail
        const channelThumbnailMatch = /"avatarViewModel":{"image":{"sources":(?<avatar_array>\[[^\]]+\])/.exec(responseText);
        if (channelThumbnailMatch && channelThumbnailMatch.groups) {
            const avatarArray = JSON.parse(channelThumbnailMatch.groups.avatar_array);
            channelInfo.thumbnail = avatarArray.find((a: any) => a.width === 160)?.url ?? avatarArray[0].url;
        }

        // Parse channel banner
        const channelBannerMatch = /"imageBannerViewModel":{"image":{"sources":(?<banner_array>\[[^\]]+\])/.exec(responseText);
        if (channelBannerMatch && channelBannerMatch.groups) {
            const bannerArray = JSON.parse(channelBannerMatch.groups.banner_array);
            channelInfo.banner = bannerArray.find((b: any) => b.height === 424)?.url ?? bannerArray[0].url;
        }

        return channelInfo;
    }
}

export class MetaProvider {
    public getMeta(): { versions: { subarr: number; node: string } } {
        return {
            versions: {
                subarr: 1.1,
                node: process.version,
            },
        };
    }
}
