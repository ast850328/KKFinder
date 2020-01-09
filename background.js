// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
const tokenURL = 'https://account.kkbox.com/oauth2/token';
const baseSearchURL = 'https://api.kkbox.com/v1.1/search';
const grantType = 'client_credentials';
const clientId = '3ac701a5aecd9339a0a59d1b48121909';
const clientSecret = 'aa6f4336f75d183d6a95bb0d4cbe8ed4';
const functions = ['track', 'album', 'artist', 'playlist'];


chrome.runtime.onInstalled.addListener(function() {

  for (let f of functions) {
    chrome.contextMenus.create({
      id: f,
      title: 'Find music by ' + f,
      type: 'normal',
      contexts: ['selection'],
    });
  }

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info);
    let type = info.menuItemId;
    let keywords = info.selectionText;

    let queryString = `grant_type=${grantType}&client_id=${clientId}&client_secret=${clientSecret}`;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', tokenURL);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log(xhr.response);
        let kkAPIToken = xhr.response.access_token;

        let searchURL = baseSearchURL + `?q=${keywords}&type=${type}&territory=TW&limit=5`;
        xhr.open('GET', searchURL);
        xhr.setRequestHeader('Authorization', 'Bearer ' + kkAPIToken);
        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let result = xhr.response;
            if (result.summary.total > 0) {
              alert(JSON.stringify(xhr.response));
            } else {
              alert('Nothing match!');
            }
          }
        }
        xhr.send();
      }
    };
    xhr.send(queryString);
  });
});
