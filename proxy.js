const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const app = express();

// API endpoint
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// 添加詳細的請求日誌中間件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
// 新增：靜態檔案服務，提供 main.html, style.css, js 目錄等靜態資源
app.use(express.static(path.resolve(__dirname)));

// 在靜態資源中間件之後新增
app.get(['/', '/main.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// 測試路由
app.get('/proxy/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'Proxy server is working!' });
});

// 代理路由
app.post('/proxy/generate-code', async (req, res) => {
    console.log('Generate code route accessed');
    try {
        const { prompt, model } = req.body;
        if (!prompt) {
            console.error('Error: Prompt is missing');
            return res.status(400).json({ error: 'Prompt is required' });
        }

        let apiKey = req.headers['authorization'];
        if (!apiKey) {
            console.error('Error: API key is missing');
            return res.status(401).json({ error: 'API key is required' });
        }

        if (apiKey.startsWith('Bearer ')) {
            apiKey = apiKey.substring(7);
        }

        console.log('Making request to OpenRouter API...');
        console.log('Using model:', model || "anthropic/claude-3-opus-20240229");

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3101'
            },
            body: JSON.stringify({
                model: model || "anthropic/claude-3-opus-20240229",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert web game developer. Please generate complete, working code for the game including HTML, CSS, and JavaScript. Keep the code efficient and well-documented."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        console.log('OpenRouter response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || errorData.error || response.statusText,
                details: errorData
            });
        }

        const data = await response.json();
        console.log('OpenRouter response data:', JSON.stringify(data, null, 2));

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid response format from OpenRouter');
            return res.status(500).json({ error: 'Invalid response format from API' });
        }

        const generatedCode = data.choices[0].message.content;
        if (!generatedCode) {
            console.error('No code generated in response');
            return res.status(500).json({ error: 'No code generated in response' });
        }

        console.log('Successfully generated code');
        res.json({ generatedCode });
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: error.stack
        });
    }
});

// 新增儲存檔案的路由
app.post('/proxy/save-code', (req, res) => {
    const { html, css, js: jsCode } = req.body;
    try {
        const rootDir = path.resolve(__dirname);
        // 處理 HTML 路徑：不做額外修改
        let processedHtml = html;

        // 直接將 HTML, CSS, JS 檔案存放在根目錄下
        fs.writeFileSync(path.join(rootDir, 'index.html'), processedHtml, 'utf-8');
        fs.writeFileSync(path.join(rootDir, 'style.css'), css, 'utf-8');
        fs.writeFileSync(path.join(rootDir, 'script.js'), jsCode, 'utf-8');
        console.log('檔案已成功儲存：index.html, style.css, script.js');
        res.json({ success: true });
    } catch (err) {
        console.error('儲存檔案失敗：', err);
        res.status(500).json({ error: err.message });
    }
});

// 啟動伺服器
const PORT = 3101;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- GET /proxy/test');
    console.log('- POST /proxy/generate-code');
    console.log('- POST /proxy/save-code');
});
