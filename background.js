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
  // var count = 1;
  // chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  //   console.log('count =', count, '; ', details.url);
  //   if (count === 3) {
  //     console.log('execute')
  //     chrome.scripting.executeScript({
  //       target: {
  //         tabId: details.tabId
  //       },
  //       files: ['content.js']
  //     });
  //     count = 1;
  //   } else {
  //     count = count + 1;
  //   }
  // }, filter2);
  let tabExecutionFlag = {};

  // Execute func in wait ms just once
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function executeContentScript(tabId) {
    if (tabExecutionFlag[tabId]) {
      return;
    }

    tabExecutionFlag[tabId] = true;
    console.log('executeContentScript')
    chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['content.js'] });

    setTimeout(() => {
      delete tabExecutionFlag[tabId];
    }, 1000);
  }

  const debouncedExecuteContentScript = debounce(executeContentScript, 1000);

  // chrome.webNavigation.onCompleted.addListener(function (details) {
  //   debouncedExecuteContentScript(details.tabId);
  // }, { url: [{ urlMatches: 'https://www.youtube.com/*' }] });

  chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    console.log('onHistoryStateUpdated')
    debouncedExecuteContentScript(details.tabId);
  }, { url: [{ urlMatches: 'https://www.youtube.com/watch\\?v=.*' }] });
})();