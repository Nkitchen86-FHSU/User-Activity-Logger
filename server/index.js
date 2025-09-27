import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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
    console.log('--- Log Batch Summary ---');
    console.log(summary);
    logs = [];
}, 10 * 1000);  // Process every 30 seconds

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