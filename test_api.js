const http = require('http');

function fetchUrl(url) {
    console.log(`Fetching: ${url}`);
    http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`--- Response for ${url} ---`);
            try {
                const json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
            } catch (e) {
                console.log(data);
            }
            console.log('---------------------------');
        });
    }).on('error', (err) => {
        console.error(`Error fetching ${url}:`, err.message);
    });
}

fetchUrl('http://localhost:5000/api/issues?type=regular');
setTimeout(() => {
    fetchUrl('http://localhost:5000/api/issues?type=special');
}, 1000);
