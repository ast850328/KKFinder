'use strict';
const authUrl = 'https://account.kkbox.com/oauth2/token';
const baseUrl = 'https://api.kkbox.com/v1.1';
const grantType = 'client_credentials';
const clientId = '3ac701a5aecd9339a0a59d1b48121909';
const clientSecret = 'aa6f4336f75d183d6a95bb0d4cbe8ed4';

const functions = ['track', 'album', 'artist', 'playlist'];

chrome.runtime.onInstalled.addListener(function() {
  createMenus();
});

function createMenus() {
  for (let f of functions) {
    chrome.contextMenus.create({
      id: f,
      title: 'Find music by ' + f,
      type: 'normal',
      contexts: ['selection'],
    });
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let type = info.menuItemId;
  let keywords = info.selectionText;
  const requestType = 'open';

  getToken$()
    .then(checkResponse)
    .then(({ access_token }) => getSearchResult$(access_token, keywords, type, 'TW', 5))
    .then(checkResponse)
    .then(({ summary, paging, tracks }) => {
      chrome.tabs.sendMessage(tab.id, { keywords, type, summary, paging, tracks, requestType });
    })
    .catch(error => console.log(error));
});

chrome.runtime.onMessage.addListener(({ requestType, offset, keywords, type }, sender) => {
  if (requestType == 'get-result') {
    const requestType = 'update';
    getToken$()
      .then(checkResponse)
      .then(({ access_token }) => getSearchResult$(access_token, keywords, type, 'TW', 5, offset))
      .then(checkResponse)
      .then(({ summary, paging, tracks }) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { keywords, type, summary, paging, tracks, requestType });
        });
      })
      .catch(error => console.log(error));
  }
});

function checkResponse(response) {
  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }

  return response.json();
}

function getSearchParams(params) {
  return Object.keys(params)
    .map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function getToken$() {
  const authData = {
    grant_type: grantType,
    client_id: clientId,
    client_secret: clientSecret,
  };

  let queryString = `grant_type=${grantType}&client_id=${clientId}&client_secret=${clientSecret}`;

  return fetch(authUrl, {
    method: 'POST',
    credentials: 'omit',
    body: getSearchParams(authData),
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/x-www-form-encoded',
    }),
  });
}

function getSearchResult$(token, q, type, territory, limit, offset=0) {
  const queryParams = {
    q,
    type,
    territory,
    limit,
    offset,
  };

  return fetch(`${baseUrl}/search?${getSearchParams(queryParams)}`, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
  });
}
