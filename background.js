// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
const tokenURL = 'https://account.kkbox.com/oauth2/token';
const baseSearchURL = 'https://api.kkbox.com/v1.1/search';
const grantType = 'client_credentials';
const clientId = '3ac701a5aecd9339a0a59d1b48121909';
const clientSecret = 'aa6f4336f75d183d6a95bb0d4cbe8ed4';


chrome.runtime.onInstalled.addListener(function() {

  // const url = 'https://account.kkbox.com/oauth2/token';
  // let queryString = `grant_type=${grantType}&client_id=${clientId}&client_secret=${clientSecret}`;

  // let xhr = new XMLHttpRequest();
  // xhr.open('POST', url);
  // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  // xhr.responseType = 'json';
  // xhr.onreadystatechange = () => {
  //   if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
  //     console.log(xhr.response);
  //     chrome.storage.sync.set({kkAPIToken: xhr.response.access_token});
  //   }
  // };
  // xhr.send(queryString);

  chrome.contextMenus.create({
    id: 'kkFinder',
    title: 'Find music in KKBOX',
    type: 'normal',
    contexts: ['selection'],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info);
    // chrome.tabs.sendMessage(tab.id, {type: "search", keywords: info.selectionText});
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

          let searchURL = baseSearchURL + `?q=${keywords}&type=track,artist&territory=TW&limit=5`;
          xhr.open('GET', searchURL);
          xhr.setRequestHeader('Authorization', 'Bearer ' + kkAPIToken);
          xhr.responseType = 'json';
          xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
              alert(JSON.stringify(xhr.response));
            }
          }
          xhr.send();
        }
      };
      xhr.send(queryString);
  });
});
