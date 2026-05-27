import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';

const artifactDir = 'C:\\Users\\ekart\\.gemini\\antigravity-ide\\brain\\6294bc04-1ea8-4c4d-bfdf-aa94f37617af';

const uploads = [
  { productId: 30, file: 'rasne_ts_model_1779858617429.png', name: 'RASNE-TS-Series.png' },
  { productId: 29, file: 'trp_1_model_1779858633321.png', name: 'TRP-1.png' },
  { productId: 28, file: 'trs_series_model_1779858649387.png', name: 'TRS-Series.png' },
  { productId: 27, file: 'trsn_d_model_1779858671227.png', name: 'TRSN-D-Series.png' },
  { productId: 26, file: 'trsn_model_1779858685775.png', name: 'TRSN-Series.png' }
];

async function uploadAndLink() {
  for (const upload of uploads) {
    const filePath = path.join(artifactDir, upload.file);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('file', blob, upload.name);
    formData.append('alt', `Product image for ${upload.name}`);

    try {
      console.log(`Uploading ${upload.name}...`);
      const res = await fetch(`${API_URL}/media`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Failed to upload media:', data);
        continue;
      }

      const mediaId = data.doc.id;
      console.log(`Uploaded media successfully, ID: ${mediaId}. Linking to product ${upload.productId}...`);

      const patchRes = await fetch(`${API_URL}/products/${upload.productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroImage: mediaId })
      });
      
      if (!patchRes.ok) {
        const patchData = await patchRes.json();
        console.error(`Failed to patch product ${upload.productId}:`, patchData);
      } else {
        console.log(`Successfully linked to product ${upload.productId}!`);
      }
    } catch (e) {
      console.error('Error during upload/patch for', upload.name, e);
    }
  }
  console.log('All done!');
}

uploadAndLink();
