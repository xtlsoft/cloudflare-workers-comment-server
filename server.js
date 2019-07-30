const DELETE_KEY      = ""; // The key you need to provide when deleting comments.
const GITHUB_TOKEN    = ""; // Your GitHub access token. Need to have "Gists" permission.
const GITHUB_USERNAME = ""; // Your GitHub username.
const GITHUB_GIST     = ""; // The ID of the Gist you want to use.
const GITHUB_API      = "https://api.github.com/gists/";
const GITHUB_RAW_URL  = "https://gist.githubusercontent.com/";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function doGitHubRequest(method, endpoint, data = "") {
  let url = GITHUB_API + GITHUB_GIST + endpoint;
  let ctx = {
    method: method,
    headers: {
      "Authorization": "token " + GITHUB_TOKEN,
      "User-Agent": "Cloudflare Workers"
    }
  };
  if (data !== "") ctx.body = data;
  return fetch(url, ctx);
}

let kv = {
  get: async (get_key) => {
    get_key = get_key.replace("/", "__") + ".json";
    let get_resp = await doGitHubRequest('GET', '/commits');
    let get_parsed_resp = await get_resp.json();
    let get_commit = get_parsed_resp[0].version;
    let new_url = GITHUB_RAW_URL + GITHUB_USERNAME + '/'
      + GITHUB_GIST + '/raw/' + get_commit + '/'
      + get_key;
    let get_file_resp = await fetch(new_url);
    if (get_file_resp.status == 404) {
      return {
        error: "Not Found"
      };
    }
    return get_file_resp.json();
  },
  put: async (put_key, put_data) => {
    put_key = put_key.replace("/", "__") + ".json";
    let put_body = {
      files: {}
    };
    put_body.files[put_key] = {
      content: JSON.stringify(put_data)
    };
    return doGitHubRequest('PATCH', '', JSON.stringify(put_body));
  }
};

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  let url = request.url;
  let splited = url.split("/");
  let method = request.method;
  let article = splited.slice(4).join("/");
  switch (method) {
    case "GET":
      let get_resp = await kv.get(article);
      if (get_resp.error) get_resp = [];
      let get_response = new Response(JSON.stringify(get_resp));
      get_response.headers.set('content-type', 'application/json');
      return get_response;
      break;
    case "POST":
      let post_body = await request.text();
      let post_parsed = JSON.parse(post_body);
      let add_all_data = await kv.get(article);
      if (add_all_data.error) add_all_data = [];
      add_all_data.push(post_parsed);
      await kv.put(article, add_all_data);
      return new Response(JSON.stringify({
        status: "success",
        id: add_all_data.length - 1
      }));
      break;
    case "DELETE":
      let delete_body = await request.text();
      let delete_splited = delete_body.split(" ");
      let delete_key = delete_splited[0];
      let delete_number = delete_splited[1];
      if (delete_key !== DELETE_KEY) {
        return new Response(JSON.stringify({
          status: "error",
          error: "Wrong Key"
        }));
      }
      if (delete_number == -1) {
        await kv.put(article, []);
      } else {
        let delete_all_parsed = await kv.get(article);
        delete delete_all_parsed[delete_number];
        await kv.put(article, delete_all_parsed);
      }
      return new Response(JSON.stringify({
        status: "success"
      }));
  }
  return new Response(JSON.stringify({
    status: "error",
    error: "Method Not Allowed"
  }));
}
