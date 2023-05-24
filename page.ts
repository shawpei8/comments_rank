(() => {
  // do when certain element exsist
  function waitForElem(selector: string, onceOnly = true) {
    return new Promise((resolve: (value: Element) => void) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector) as Element);
      }
      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector) as Element);
          if (onceOnly) {
            observer.disconnect();
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  function highlightMenuItem(item: Element) {
    item.classList.add('iron-selected');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-selected', 'true');
  }

  function lowlightMenuItem(item: Element) {
    item.classList.remove('iron-selected');
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-selected', 'false');
  }


  let currentSelectedItem: sortByItems;
  let sortByBox: Element;
  enum sortByItems {
    TOP_COMMENTS,
    NEWEST_FIRST,
    MOST_LIKES,
    MOST_REPLIES
  };
  waitForElem("#sort-menu").then((elem) => {
    // console.log(elem);
    const sortBySelector = "tp-yt-paper-listbox";
    const sortByItemTxtSelector = "div.item";
    sortByBox = elem.querySelector(sortBySelector) as Element;
    const menuItems = sortByBox.children;
    let lastSelectedItem = sortByItems.TOP_COMMENTS
    currentSelectedItem = lastSelectedItem;

    const sortMenuBtn = elem as HTMLElement;
    sortMenuBtn.addEventListener('click', () => {
      if (currentSelectedItem !== lastSelectedItem) {
        lowlightMenuItem(menuItems[lastSelectedItem]);
      }
      setTimeout(() => {
        // focus style added by youtube
        (menuItems[currentSelectedItem].children[0] as HTMLElement).focus();
      }, 100);
    });

    if (sortByBox.children.length === 3) {
      // add 'Most likes' item
      const likeItem = <HTMLElement>sortByBox.children[1].cloneNode(true);
      (likeItem.querySelector(sortByItemTxtSelector) as HTMLElement).innerText = 'Most likes';
      sortByBox.children[1].insertAdjacentElement('afterend', likeItem);
      likeItem.addEventListener('click', () => {
        if (currentSelectedItem !== sortByItems.MOST_LIKES) {
          lowlightMenuItem(menuItems[currentSelectedItem]);
          highlightMenuItem(likeItem);
          lastSelectedItem = currentSelectedItem;
          currentSelectedItem = sortByItems.MOST_LIKES;
        }
        sortComments(nlikes);
        setTimeout(() => sortMenuBtn.click(), 300);
      });
      // add 'Most replies' item
      const replyItem = <Element>sortByBox.children[1].cloneNode(true);
      (replyItem.querySelector(sortByItemTxtSelector) as HTMLElement).innerText = 'Most replies';
      sortByBox.children[2].insertAdjacentElement('afterend', replyItem);
      replyItem.addEventListener('click', () => {
        if (currentSelectedItem !== sortByItems.MOST_REPLIES) {
          lowlightMenuItem(menuItems[currentSelectedItem]);
          highlightMenuItem(replyItem);
          lastSelectedItem = currentSelectedItem;
          currentSelectedItem = sortByItems.MOST_REPLIES;
        }
        sortComments(nreplies);
        setTimeout(() => sortMenuBtn.click(), 300);
      });
    };

    for (let i = 0; i < 2; i++) {
      menuItems[i].addEventListener('click', () => {
        if (menuItems[currentSelectedItem] !== menuItems[i]) {
          lowlightMenuItem(menuItems[currentSelectedItem]);
          highlightMenuItem(menuItems[i]);
          lastSelectedItem = currentSelectedItem;
          currentSelectedItem = i;
        }
      })
    }
  });

  type ExtractFunc = (elem: Element) => number;

  function nlikes(elem: Element): number {
    const likeBtn = elem.querySelector("#like-button button") as HTMLButtonElement;
    const likes = likeBtn?.getAttribute("aria-label")!.match(/[\d,]+/g);
    return parseInt(likes?.[0]?.replace(/,/g, '') || '0');
  }

  function nreplies(elem: Element): number {
    const replyBtn = elem.querySelector("#more-replies button") as HTMLButtonElement;
    const replies = replyBtn?.getAttribute("aria-label")!.match(/[\d,]+/g);
    return parseInt(replies?.[0]?.replace(/,/g, '') || '0');
  }

  const commentSelector = "ytd-comment-thread-renderer";
  const contentsSelector = "#comments #contents";

  async function getComments() {
    const comments = document.querySelectorAll(commentSelector);
    const commentsArr = Array.from(comments);
    return commentsArr;
  }
  async function sortComments(callback: ExtractFunc) {
    // descending order
    function compare(firstEl: Element, secondEl: Element) {
      return callback(secondEl) - callback(firstEl);
    }

    const contents = document.querySelector(contentsSelector);
    if (contents) {
      const comments = await getComments();
      comments.sort(compare);

      // save last element which used to trigger new request when scroll
      const lastChild = contents.lastChild as ChildNode;

      // show sorted results
      contents.innerHTML = '';
      for (const comment of comments) {
        contents.appendChild(comment);
      }
      contents.appendChild(lastChild);
    }
  }

  waitForElem(contentsSelector).then((elem) => {
    const observer = new MutationObserver(mutations => {
      // console.log(mutations);
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'YTD-CONTINUATION-ITEM-RENDERER') {
              observer.disconnect();
              if (currentSelectedItem === sortByItems.MOST_LIKES) {
                sortComments(nlikes);
              } else if (currentSelectedItem === sortByItems.MOST_REPLIES) {
                sortComments(nreplies);
              }
              setTimeout(() => {
                observer.observe(elem, { childList: true });
              }, 200); // prevent infinite loop
            }
          });
        }
      });
    });
    observer.observe(elem, { childList: true });
  });

  waitForElem('#comments').then(elem => {
    console.log(elem);
    // create the button element
    const toTopButton = document.createElement('top-button');
    toTopButton.className = 'back-to-top';
    toTopButton.innerHTML = '<div class="arrow-up"></div>';
    let arrowDirection = 'up';

    // Position the button
    elem.insertAdjacentElement("afterend", toTopButton);
    function positionButton() {
      const commentsWidth = toTopButton.parentElement?.offsetWidth as number - 13;
      toTopButton.style.left = `${(toTopButton.parentElement?.offsetLeft ?? 0) + commentsWidth}px`;
    }
    positionButton();
    window.addEventListener('resize', positionButton);


    const menuHeight = document.querySelector('#masthead')?.getBoundingClientRect().height as number;
    let currentScrollTop = 0;
    let previousScrollTop = 0;
    window.addEventListener('scroll', () => {
      currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      const commentsTop = elem.getBoundingClientRect().top;
      // Make sure the button is visible when scrolling to comments top
      // if (window.scrollY > document.documentElement.clientHeight * 2) {
      if (commentsTop - menuHeight - toTopButton.offsetHeight < 0) {
        toTopButton.style.visibility = 'visible';
      } else {
        toTopButton.style.visibility = 'hidden';
      }
    });

    // Back to top button click event
    toTopButton.addEventListener('click', function (event) {
      event.preventDefault();
      if (currentScrollTop > previousScrollTop) {
        previousScrollTop = currentScrollTop;
      }
      if (previousScrollTop !== 0 && arrowDirection === 'down') {
        window.scrollTo({ top: previousScrollTop, left: 0, behavior: 'smooth' });
        const transforms = toTopButton.style.transform.split(' ');
        transforms.pop();
        toTopButton.style.transform = transforms.join(' ');
        arrowDirection = 'up';
      }
      else {
        const elemTop = elem.getBoundingClientRect().top + window.scrollY;
        const header = elem.querySelector('#header')?.children[0] as Element;
        const style = window.getComputedStyle(header);
        const marginTop = parseInt(style.getPropertyValue('margin-top'));
        const scrollY = elemTop - menuHeight - marginTop;
        setTimeout(() => {
          //  a strange bug, the scrollTo function doesn't work if it is called directly sometimes
          window.scrollTo({ top: scrollY, left: 0, behavior: 'smooth' });
        }, 200);
        toTopButton.style.transform += 'rotate(180deg)';
        arrowDirection = 'down';
      }
    });
  });
})();