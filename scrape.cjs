const https = require('https');

function fetchImages(url) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const regex = /src=["']([^"']+\.(jpg|png|jpeg))["']/gi;
      let match;
      const images = [];
      while ((match = regex.exec(data)) !== null) {
        images.push(match[1]);
      }
      console.log('Found images for', url, ':', images.slice(0, 5));
    });
  }).on('error', console.error);
}

fetchImages('https://www.fietest.com/rockwell-hardness-tester.html');
fetchImages('https://www.fietest.com/portable-hardness-tester.html');
