// Netlify Function: update-products
// Updates the products JSON file in the configured GitHub repository via the GitHub Contents API.
// Required env vars: GITHUB_TOKEN, REPO_OWNER, REPO_NAME, FILE_PATH, ADMIN_TOKEN

exports.handler = async function(event, context) {
  const OWNER = process.env.REPO_OWNER;
  const REPO = process.env.REPO_NAME;
  const PATH = process.env.FILE_PATH || 'data/products.json';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // token to protect updates

  if (!OWNER || !REPO || !GITHUB_TOKEN || !ADMIN_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing server configuration.' }) };
  }

  // Basic auth: expect header x-admin-token
  const reqToken = (event.headers && (event.headers['x-admin-token'] || event.headers['X-Admin-Token'])) || '';
  if (!reqToken || reqToken !== ADMIN_TOKEN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // Read current file to get SHA
  const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  try {
    const getRes = await fetch(getUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    if (!getRes.ok) {
      const txt = await getRes.text();
      return { statusCode: getRes.status, body: JSON.stringify({ error: txt }) };
    }

    const cur = await getRes.json();
    const curSha = cur.sha;

    const contentBase64 = Buffer.from(JSON.stringify(body, null, 2), 'utf8').toString('base64');

    const putRes = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update products.json via Netlify Function',
        content: contentBase64,
        sha: curSha
      })
    });

    const putJson = await putRes.json();
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: JSON.stringify({ error: putJson }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, result: putJson }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
