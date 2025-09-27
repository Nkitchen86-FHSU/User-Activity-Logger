import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Keep track of clients to send batch data to
let clients = [];

app.get('/events', (req, res) => {
    // Set headers for response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Push this client into the array
    clients.push(res);

    // Remove client on disconnect
    res.on('close', () => {
        clients = clients.filter(c => c !== res);
    });
});

let logs = [];

// Endpoint to receive logs
app.post('/log', (req, res) => {
    const {type, details, timestamp } = req.body;
    logs.push({ type, details, timestamp });
    res.status(200).json({ status: 'ok '});
});

// Periodically process logs in batches
setInterval(() => {
    if (logs.length === 0) return console.log('No Activity...');
    const summary = aggregateLogs(logs);
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(summary)}\n\n`);
    });
    console.log('--- Log Batch Summary ---');
    console.log(summary);
    logs = [];
}, 2 * 60 * 1000);  // Process every 2 minutes

function aggregateLogs(events) {
    const counts = {};
    events.forEach(e => {
        counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return {
        total: events.length,
        counts,
        from: new Date(events[0].timestamp).toLocaleTimeString(),
        to: new Date(events[events.length - 1].timestamp).toLocaleTimeString()
    };
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})