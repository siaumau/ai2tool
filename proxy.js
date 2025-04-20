const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
                'HTTP-Referer': 'http://localhost:3101',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                model: model || "anthropic/claude-3-opus-20240229",
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: "你是一個專業的網頁遊戲開發專家。請生成完整可執行的代碼，包含 HTML、CSS 和 JavaScript。確保代碼經過優化且易於理解。"
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

        // 設置響應頭，支持流式傳輸
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 創建可讀流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedCode = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    // 發送完整的代碼
                    res.write(`data: ${JSON.stringify({ done: true, generatedCode: accumulatedCode })}\n\n`);
                    res.end();
                    break;
                }

                // 解碼收到的數據
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.choices && data.choices[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                accumulatedCode += content;
                                // 發送部分內容
                                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                            }
                        } catch (e) {
                            console.warn('Error parsing SSE message:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Stream processing error:', error);
            res.write(`data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`);
            res.end();
        }
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: error.stack
        });
    }
});

// 啟動伺服器
const PORT = 3101;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- GET /proxy/test');
    console.log('- POST /proxy/generate-code');
});
