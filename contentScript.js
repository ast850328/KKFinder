chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);

  switch (request.type) {
    case 'result':
      const data = JSON.stringify(request.data);
      const div = document.createElement('div');
      request.data.tracks.data.map(track => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${track.url}">${track.name}</a>`;
        div.appendChild(li);
      });
      document.body.appendChild(div);
      alert(data);
      break;
  }
});
