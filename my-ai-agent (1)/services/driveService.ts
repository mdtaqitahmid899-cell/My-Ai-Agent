import type { DriveFile, BackupData } from '../types';

declare var gapi: any;
declare var google: any;

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'My-Ai-Data';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGapi = (clientId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (gapiInited && gisInited) {
            resolve();
            return;
        }

        const gapiLoaded = () => {
            gapi.load('client', async () => {
                await gapi.client.init({
                    // apiKey: API_KEY, // Optional for this flow
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                });
                gapiInited = true;
                if (gisInited) resolve();
            });
        };

        const gisLoaded = () => {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                callback: '', // defined later
            });
            gisInited = true;
            if (gapiInited) resolve();
        };

        if (typeof gapi !== 'undefined') gapiLoaded();
        if (typeof google !== 'undefined') gisLoaded();

        // Fallback checks if scripts load after this function call
        // @ts-ignore
        window.gapiLoaded = gapiLoaded;
        // @ts-ignore
        window.gisLoaded = gisLoaded;
    });
};

export const handleAuthClick = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject('Token client not initialized');
            return;
        }
        
        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                reject(resp);
                return;
            }
            resolve();
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

const findOrCreateFolder = async (): Promise<string> => {
    try {
        const response = await gapi.client.drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const files = response.result.files;
        if (files && files.length > 0) {
            return files[0].id;
        } else {
            const createResponse = await gapi.client.drive.files.create({
                resource: {
                    name: FOLDER_NAME,
                    mimeType: 'application/vnd.google-apps.folder',
                },
                fields: 'id',
            });
            return createResponse.result.id;
        }
    } catch (err) {
        console.error('Error finding/creating folder', err);
        throw err;
    }
};

export const saveBackup = async (data: BackupData): Promise<void> => {
    try {
        const folderId = await findOrCreateFolder();
        const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        const fileContent = JSON.stringify(data, null, 2);
        const file = new Blob([fileContent], { type: 'application/json' });
        const metadata = {
            name: fileName,
            mimeType: 'application/json',
            parents: [folderId],
        };

        const accessToken = gapi.client.getToken().access_token;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        });

    } catch (err) {
        console.error('Error saving backup', err);
        throw err;
    }
};

export const listBackups = async (): Promise<DriveFile[]> => {
    try {
        const folderId = await findOrCreateFolder();
        const response = await gapi.client.drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
            fields: 'files(id, name, createdTime)',
            orderBy: 'createdTime desc',
        });
        return response.result.files || [];
    } catch (err) {
        console.error('Error listing backups', err);
        throw err;
    }
};

export const loadBackup = async (fileId: string): Promise<BackupData> => {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        return response.result as BackupData;
    } catch (err) {
        console.error('Error loading backup', err);
        throw err;
    }
};

export const signOut = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
    }
};