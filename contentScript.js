// let div = document.createElement('div');
const tokenURL = 'https://account.kkbox.com/oauth2/token';
const baseSearchURL = 'https://api.kkbox.com/v1.1/search';
const grantType = 'client_credentials';
const clientId = '3ac701a5aecd9339a0a59d1b48121909';
const clientSecret = 'aa6f4336f75d183d6a95bb0d4cbe8ed4'

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  console.log(request);
  switch (request.type){
    case "search":
      console.log(request.keywords);
      let keywords = request.keywords;

      let queryString = `grant_type=${grantType}&client_id=${clientId}&client_secret=${clientSecret}`;
      let xhr = new XMLHttpRequest();
      xhr.open('POST', tokenURL);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.responseType = 'json';
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          console.log(xhr.response);
          let kkAPIToken = xhr.response.access_token;

          let searchURL = baseSearchURL + `?q=${keywords}&type=track,album,astist,playlist&territory=TW`
          xhr.open('GET', searchURL);
          xhr.setRequestHeader('Authorization', 'Bearer ' + kkAPIToken);
          xhr.responseType = 'json';
          xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
              alert(xhr.response);
            }
          }
          xhr.send();
        }
      };
      xhr.send(queryString);
      console.log(xhr.response);
      break;
  }
});
