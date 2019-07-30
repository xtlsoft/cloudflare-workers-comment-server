# cloudflare-workers-comment-server

Use Cloudflare Workers as a comment service. (datastore using GitHub Gists.)

## Usage

### Server Deployment

Clone this repo. Edit `worker.js`: change the constants into your GitHub credentials.

Then copy the content of `worker.js` into Cloudflare Workers script editor.

Add a router, and then click `deploy`.

### Client Side

Here's a `comment.js` available: <https://blog.xtlsoft.top/comment/comment.js>.

(It uses `mdui.JQ.ajax()`, but it won't be difficult if you want to use `jQuery.ajax()` or `fetch()`)
