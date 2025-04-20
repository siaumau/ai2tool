const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Proxy route
app.post('/proxy/generate-code', async (req, res) => {
    const { prompt, model } = req.body;
    const apiKey = req.headers['authorization'];

    try {
        const response = await fetch('https://openrouter.com/generate-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            body: JSON.stringify({ prompt, model })
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: response.statusText });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
const PORT = 3101;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
