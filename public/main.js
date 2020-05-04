(function(w, d) {
  // eslint-disable-next-line require-jsdoc
  async function post(url, data) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  d.getElementById('action').addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    const button = e.target;
    const result = d.getElementById('result');
    const search = String(d.getElementById('search').value).trim();
    const limit = parseInt(d.getElementById('limit').value, 10);
    try {
      button.disabled = true;
      const data = await post('/search', {search, limit});
      if (Array.isArray(data)) {
        const json = JSON.stringify(data, null, 2);
        result.value = `Count: ${data.length}\n${json}`;
      } else if (data && data.error) {
        throw data.error;
      }
    } catch (e) {
      result.value = `Error: ${e.message}`;
    }
    button.disabled = false;
  });
}(window, window.document));
