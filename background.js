(() => {
  chrome.action.onClicked.addListener((tab) => {
    // chrome.scripting.executeScript({
    //   target: {
    //     tabId: tab.id
    //   },
    //   files: ['content.js']
    // });
  });
  filter1 = {
    url: [{
      urlMatches: '^https://www\.youtube\.com/watch\\?v\\=[\\w]+$',
    }]
  };
  filter2 = {
    url: [{
      urlMatches: '^https://www\.youtube\.com/.*'
    }]
  };
  var count = 0;
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    // console.log('count: ', count, '; ', details.url);
    if (count === 4) {
      // console.log('execute')
      chrome.scripting.executeScript({
        target: {
          tabId: details.tabId
        },
        files: ['content.js']
      });
      count = 1;
    } else {
      count = count + 1;
    }
  }, filter2);
  /*
  chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
    console.log('new tab');
    chrome.scripting.executeScript({
      target: {
        tabId: details.tabId
      },
      files: ['content.js']
    });
  }, filter1);
  chrome.webNavigation.onCommitted.addListener((details) => {
    if (['reload', 'nothing'].includes(details.transitionType)) {
      console.log('onCommitted')
      chrome.webNavigation.onCompleted.addListener(function onComplete() {
        chrome.scripting.executeScript({
          target: {
            tabId: details.tabId
          },
          files: ['content.js']
        })
        chrome.webNavigation.onCompleted.removeListener(onComplete);
      })
    }
  }, filter2)
  */
})();