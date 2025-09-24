const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL; // e.g. https://api.deepseek.example
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_BASE) {
    console.warn('未设置 DEEPSEEK_BASE_URL，代理请求将无法正常工作。');
}

// 通用代理端点：按 path 转发到 DeepSeek
app.post('/api/deepseek/:action', async (req, res) => {
    const action = req.params.action;
    const url = `${DEEPSEEK_BASE}/${action}`;
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            },
            body: JSON.stringify(req.body),
        });
        const data = await resp.text();
        res.status(resp.status).send(data);
    } catch (err) {
        console.error('代理请求失败', err);
        res.status(500).json({ error: 'proxy_error', detail: String(err) });
    }
});

const port = process.env.PORT || 5173;
app.listen(port, () => {
    console.log(`Proxy server listening on ${port}`);
});


