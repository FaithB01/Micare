// Netlify Function: get-products
// Reads the products JSON file from the configured GitHub repository via the GitHub Contents API.
// Required env vars: GITHUB_TOKEN, REPO_OWNER, REPO_NAME, FILE_PATH

exports.handler = async function(event, context) {
  const OWNER = process.env.REPO_OWNER;
  const REPO = process.env.REPO_NAME;
  const PATH = process.env.FILE_PATH || 'data/products.json';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!OWNER || !REPO || !GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing repository configuration on server.' }) };
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: txt }) };
    }

    const data = await res.json();
    const content = data.content || '';
    const decoded = Buffer.from(content, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
