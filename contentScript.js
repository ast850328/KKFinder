// global var
_keywords = '';
_type = '';

chrome.runtime.onMessage.addListener(function(
  { keywords, type, summary, paging, tracks, requestType },
  sender,
  sendResponse
) {
  _keywords = keywords;
  _type = type;
  if (requestType == 'open') {
    clearHistory();
    open();
  }
  // else if (requestType == 'update')
  renderTracks(tracks.data, paging.offset);
  setPaginationState(paging);
});

function open() {
  /* container */
  const containerEl = document.createElement('div');
  containerEl.id = 'kkfinder-container';

  /* header */
  const headerEl = document.createElement('div');
  headerEl.id = 'kkfinder-header';

  const sunnywormEl = document.createElement('img');
  sunnywormEl.id = 'kkfinder-sunnyworm';
  sunnywormEl.src = 'https://yuer.tw/sunnyworm.png';

  const titleEl = document.createElement('div');
  titleEl.id = 'kkfinder-title';
  titleEl.innerText = `KKFinder`;

  const closeButtonEl = document.createElement('div');
  closeButtonEl.id = 'kkfinder-close';
  closeButtonEl.onclick = close.bind(containerEl);

  headerEl.appendChild(sunnywormEl);
  headerEl.appendChild(titleEl);
  headerEl.appendChild(closeButtonEl);

  /* content */
  const contentEl = document.createElement('div');
  contentEl.id = 'kkfinder-content';

  /* footer */
  const footerEl = document.createElement('div');
  footerEl.id = 'kkfinder-footer';
  const paginationEl = document.createElement('div');
  paginationEl.id = 'kkfinder-pagination';
  footerEl.appendChild(paginationEl);

  containerEl.appendChild(headerEl);
  containerEl.appendChild(contentEl);
  containerEl.appendChild(footerEl);
  document.body.appendChild(containerEl);
}

function close() {
  this.remove();
}

function getFormatDuration(duration = 0) {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600000);
  const mins = ~~((duration / 60000) % 60000);
  const secs = ~~((~~duration % 60000) / 1000);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = '';

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

function renderTracks(tracks, offset) {
  const contentEl = document.getElementById('kkfinder-content');
  contentEl.innerHTML = '';
  if (tracks.length == 0) {
    contentEl.innerHTML = 'Result not found!';
  }
  tracks.map((track = {}, index) => {
    const trackLineNumber = offset + index + 1;
    const trackName = track.name || 'N/A';
    const trackUrl = track.url || '';
    const trackDuration = getFormatDuration(track.duration);
    const album = track.album || {};
    const artist = album.artist || {};
    const albumName = album.name || 'N/A';
    const albumImageUrl = (album.images[0] || {}).url || '';
    const artistName = artist.name || 'N/A';

    const trackWrapperEl = document.createElement('div');
    trackWrapperEl.className = 'kkfinder-track-wrapper';

    const trackLineNumberEl = document.createElement('div');
    trackLineNumberEl.innerText = trackLineNumber;

    const albumImageEl = document.createElement('img');
    albumImageEl.className = 'kkfinder-album-image';
    albumImageEl.src = albumImageUrl;

    const trackDetailEl = document.createElement('div');
    trackDetailEl.className = 'kkfinder-track-detail';
    const trackNameEl = document.createElement('div');
    trackNameEl.innerText = trackName;
    const trackDurationEl = document.createElement('div');
    trackDurationEl.innerText = trackDuration;
    const artistNameEl = document.createElement('div');
    artistNameEl.innerText = artistName;
    const albumNameEl = document.createElement('div');
    albumNameEl.innerText = albumName;

    trackDetailEl.appendChild(trackNameEl);
    trackDetailEl.appendChild(artistNameEl);
    trackDetailEl.appendChild(albumNameEl);
    trackDetailEl.appendChild(trackDurationEl);

    const navigatorEl = document.createElement('div');
    navigatorEl.innerHTML = `<a href="${trackUrl}" target="_blank">Go!</a>`;

    trackWrapperEl.appendChild(trackLineNumberEl);
    trackWrapperEl.appendChild(albumImageEl);
    trackWrapperEl.appendChild(trackDetailEl);
    trackWrapperEl.appendChild(navigatorEl);

    contentEl.appendChild(trackWrapperEl);
  });
}

function setPaginationState({ previous, next, offset, limit }) {
  const currentPage = offset / limit + 1;
  const paginationEl = document.getElementById('kkfinder-pagination');
  paginationEl.innerHTML = '';
  const paginateToLeftEl = document.createElement('span');
  paginateToLeftEl.id = 'kkfinder-paginate-to-left';
  paginateToLeftEl.innerText = '«';
  if (previous) {
    paginateToLeftEl.classList.add('kkfinder-paginate-link');
    paginateToLeftEl.addEventListener('click', getNewResult(offset-5));
  }else {
    paginateToLeftEl.classList.remove('kkfinder-paginate-link');
  }
  const paginationCurrentPageEl = document.createElement('span');
  paginationCurrentPageEl.id = 'kkfinder-paginate-current-page';
  paginationCurrentPageEl.innerHTML = '' + currentPage;
  const paginateToRightEl = document.createElement('span');
  paginateToRightEl.id = 'kkfinder-paginate-to-right';
  paginateToRightEl.innerText = '»';
  if (next) {
    paginateToRightEl.classList.add('kkfinder-paginate-link');
    paginateToRightEl.addEventListener('click', getNewResult(offset+5));
  } else {
    paginateToRightEl.classList.remove('kkfinder-paginate-link');
  }
  paginationEl.appendChild(paginateToLeftEl);
  paginationEl.appendChild(paginationCurrentPageEl);
  paginationEl.appendChild(paginateToRightEl);
}

function clearHistory(){
  const containerEl = document.getElementById('kkfinder-container');
  if (containerEl) { containerEl.remove() }
}

function getNewResult(offset) {
  return function (event) {
    chrome.runtime.sendMessage({ requestType: 'get-result', offset, keywords: _keywords, type: _type });
  };
}
