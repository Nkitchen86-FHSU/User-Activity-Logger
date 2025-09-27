import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let logs = [];
let allLogs = [];
const logFilePath = path.join(__dirname, 'logs.txt');

if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
    console.log('Log file created!');
}

// Endpoint to receive logs
app.post('/log', (req, res) => {
    const {type, details, timestamp } = req.body;
    logs.push({ type, details, timestamp });
    res.status(200).json({ status: 'ok '});
});

// Periodically process logs in batches
setInterval(() => {
    if (logs.length === 0) return console.log('No Activity...');
    allLogs.push(...logs);
    const summary = aggregateLogs(logs);
    console.log('--- Log Batch Summary ---');
    console.log(summary);
    try {
        fs.writeFileSync(logFilePath, JSON.stringify(allLogs, null, 2));
        console.log('Logs added to logs.txt successfully');
    } catch (err) {
        console.log(`Error writing file: ${err}`);
    }
    logs = [];
}, 10 * 1000);  // Process every 10 seconds

// Periodically clear the logs.txt file
setInterval(() => {
    try {
        fs.writeFileSync(logFilePath, '');
        console.log('logs.txt cleared');
    } catch (err) {
        console.log(`Error writing file: ${err}`);
    }
}, 60 * 1000); // Reset every 60 seconds

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