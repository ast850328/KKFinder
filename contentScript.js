chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  console.log(request);
  switch (request.type){
    case "result":
      let data = request.data;
      alert(request.data);
      break;
  }
});
