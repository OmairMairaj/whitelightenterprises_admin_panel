// pages/api/auth/callback.js
import axios from 'axios';
import { IG_APP_ID, IG_APP_SECRET, Web_URL } from '../../app/config'

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is missing' });
    }

    try {
        const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', null, {
            params: {
                client_id: IG_APP_ID,
                client_secret: IG_APP_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: `${Web_URL}/api/ig_callback`,
                code,
            },
        });

        const { access_token } = tokenResponse.data;


        res.redirect(`/dashboard/save-token?token=${access_token}`);
    } catch (error) {
        console.error('Error exchanging code for token:', error.response.data);
        res.status(500).json({ error: 'Failed to exchange code for access token' });
    }
}
