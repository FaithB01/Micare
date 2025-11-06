Netlify Functions + GitHub-backed products storage

Overview
- This project includes two Netlify Functions: `get-products` and `update-products` located in `netlify/functions/`.
- The functions read and write `data/products.json` in this repository using the GitHub Contents API.

Required environment variables (set these in your Netlify site settings -> Build & deploy -> Environment -> Environment variables):
- GITHUB_TOKEN: a GitHub personal access token (repo scope) so the function can read/write the file in the repository.
- REPO_OWNER: the GitHub username or organization that owns the repository (e.g., FaithB01).
- REPO_NAME: the repository name (e.g., Micare).
- FILE_PATH: the path to the products file in the repo (default: `data/products.json`).
- ADMIN_TOKEN: a secret token used to protect update operations (choose a strong random string).

How it works
- GET /.netlify/functions/get-products -> returns the parsed JSON from data/products.json
- POST /.netlify/functions/update-products -> accepts JSON body of products and updates the file in the repository; requires header `x-admin-token` equal to the ADMIN_TOKEN env var.

Deployment notes
1. Add the new files to your repo and push.
2. Connect the repo to Netlify and deploy. In Netlify site settings add the above environment variables.
3. After deploy, the static site can call the functions via `/api/get-products` and `/api/update-products` (redirects configured in netlify.toml map `/api/*` to `/.netlify/functions/*`).

Client usage
- The frontend (cms.html) now supports a "Use server storage" toggle. When enabled, it will load products from the server and the "Save to Server" button will POST the product JSON to the update endpoint with the `x-admin-token` header.

Security
- Admin updates are protected by `ADMIN_TOKEN` that you set in Netlify. Keep this secret; do not commit it to the repo.
- The GitHub token must have repo permissions; keep it secret as well.

If you want, I can:
- Add a small GitHub Actions workflow to update the products file automatically when changes are merged.
- Replace GitHub storage with S3 or another storage provider if you prefer.
