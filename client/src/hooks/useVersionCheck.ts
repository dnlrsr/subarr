import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { GitHubRelease } from '../types';

export const useVersionCheck = () => {
    const [currentVersion, setCurrentVersion] = useState<number | null>(null);
    const [newVersionInfo, setNewVersionInfo] = useState<GitHubRelease | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkForUpdate = async () => {
            try {
                setLoading(true);

                const metaResponse = await apiService.getMeta();
                const currentVersionNumber = metaResponse.versions.subarr;
                setCurrentVersion(currentVersionNumber);

                const latestVersionInfo = await apiService.getLatestGitHubRelease();
                const latestVersionNumber = Number(latestVersionInfo.tag_name);

                if (currentVersionNumber < latestVersionNumber) {
                    setNewVersionInfo(latestVersionInfo);
                    setUpdateAvailable(true);
                }
            } catch (err) {
                console.error('Failed to check for updates:', err);
            } finally {
                setLoading(false);
            }
        };

        checkForUpdate();
    }, []);

    return {
        currentVersion,
        newVersionInfo,
        updateAvailable,
        loading,
    };
};
