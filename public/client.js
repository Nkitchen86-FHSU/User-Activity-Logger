const sendEvent = async (type, details) => {
    try {
        const res = await fetch('/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, details, timestamp: Date.now() })
        })
        if (!res.ok) throw new Error('Network response was not ok');
        console.log(`Event logged: ${type}`);
    } catch (err) {
        console.error(`Failed to log event ${err}`);
    }
};

document.getElementById('actionBtn').addEventListener('click', () => {
    sendEvent('button_click', 'User clicked the main button');
});

document.getElementById('demoForm').addEventListener('submit', e => {
    e.preventDefault();
    sendEvent('form_submit', 'User submitted the form');
});