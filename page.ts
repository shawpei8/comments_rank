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


  let currentSelectedItem: Element;
  let sortByBox: Element;
  waitForElem("#sort-menu").then((elem) => {
    // console.log(elem);
    const sortBySelector = "tp-yt-paper-listbox";
    const sortByItemTxtSelector = "div.item";
    sortByBox = elem.querySelector(sortBySelector) as Element;
    let lastSelectedItem = sortByBox.children[0];
    currentSelectedItem = lastSelectedItem;

    const sortMenuBtn = document.querySelector("#sort-menu") as HTMLElement;
    sortMenuBtn?.addEventListener('click', () => {
      if (currentSelectedItem !== lastSelectedItem) {
        lowlightMenuItem(lastSelectedItem);
        lastSelectedItem = currentSelectedItem;
      }
    });


    if (sortByBox.children.length === 3) {
      // add 'Most likes' item
      const likeItem = <HTMLElement>sortByBox.children[1].cloneNode(true);
      (likeItem.querySelector(sortByItemTxtSelector) as HTMLElement).innerText = 'Most likes';
      sortByBox.children[1].insertAdjacentElement('afterend', likeItem);
      likeItem.addEventListener('click', () => {
        sortComments(nlikes);
        setTimeout(() => sortMenuBtn.click(), 500);
      });
      // add 'Most replies' item
      const replyItem = <Element>sortByBox.children[1].cloneNode(true);
      (replyItem.querySelector(sortByItemTxtSelector) as HTMLElement).innerText = 'Most replies';
      sortByBox.children[2].insertAdjacentElement('afterend', replyItem);
      replyItem.addEventListener('click', () => {
        sortComments(nreplies);
        setTimeout(() => sortMenuBtn.click(), 500);
      });
    };
    for (const item of sortByBox.children) {
      item.addEventListener('click', () => {
        if (currentSelectedItem !== item) {
          lowlightMenuItem(currentSelectedItem);
          highlightMenuItem(item);
          currentSelectedItem = item;
        }
      });
    }
  });

  type ExtractFunc = (elem: Element) => number;

  function nlikes(elem: Element): number {
    const likeBtnSelector = "#like-button button";
    const likeBtn = elem.querySelector(likeBtnSelector) as Element;
    const likes = likeBtn.getAttribute("aria-label")?.split(' ')[5].split(',') as string[];
    return parseInt(likes.join(''));
  }

  function nreplies(elem: Element): number {
    const replyBtnSelector = "#more-replies button";
    const replyBtn = elem.querySelector(replyBtnSelector) as Element;
    if (!replyBtn) return 0;
    const replies = replyBtn.getAttribute("aria-label")?.split(' ')[0].split(',') as string[];
    return parseInt(replies.join(''));
  }

  const commentSelector = "ytd-comment-thread-renderer";
  const contentsSelector = "#comments #contents";
  function sortComments(callback: ExtractFunc) {
    // descending order
    function compare(firstEl: Element, secondEl: Element) {
      return callback(secondEl) - callback(firstEl);
    }

    const contents = document.querySelector(contentsSelector);
    if (contents) {
      const comments = Array.from(contents.querySelectorAll(commentSelector));
      // sort comments accroding to compare function
      comments.sort(compare);

      // save last element which used to trigger new request when scroll
      const lastChild = contents.lastChild as ChildNode;
      // remove comments of contents
      while (contents.firstChild) {
        contents.removeChild(contents.firstChild);
      }

      // add sorted comments to contents
      for (const comment of comments) {
        contents.appendChild(comment);
      }
      contents.appendChild(lastChild);
    }
  }
  function isMultipleof21(num: number) {
    return num % 21 == 0;
  }

  waitForElem(contentsSelector).then((elem) => {
    let count = 0;
    const observer = new MutationObserver(mutations => {
      // console.log(mutations);
      mutations.forEach(mutation => {
        count += mutation.addedNodes.length;
      });
      if (count !== 21 && isMultipleof21(count)) {
        observer.disconnect(); // stop observing mutations
        if (currentSelectedItem === sortByBox.children[2]) {
          sortComments(nlikes);
        } else if (currentSelectedItem === sortByBox.children[3]) {
          sortComments(nreplies);
        }
        console.log('count is ' + count);
        observer.observe(elem, { childList: true }); // start observing mutations again
      }
    });
    observer.observe(elem, { childList: true });
  });

  // function scrollToPosition(position: number, retries = 10) {
  //   console.log('retries is ' + retries);
  //   window.scrollTo({ top: position, left: 0, behavior: 'smooth' });
  //   if (Math.abs(window.scrollY - position) > 5 && retries > 0) {
  //     scrollToPosition(position, retries - 1);
  //   }
  // };

  waitForElem('#comments').then(elem => {
    console.log(elem);
    // create the button element
    const toTopButton = document.createElement('top-button');
    toTopButton.className = 'back-to-top';
    toTopButton.innerHTML = '<div class="arrow-up"></div>';
    let arrowDirection = 'up';

    // Add the button to the comments sections
    elem.insertAdjacentElement("afterend", toTopButton);
    const commentsWidth = toTopButton.parentElement?.offsetWidth as number - 13;
    const menuHeight = document.querySelector('#masthead')?.getBoundingClientRect().height as number;
    toTopButton.style.transform += `translateX(${commentsWidth}px)`;
    let currentScrollTop = 0;
    let previousScrollTop = 0;
    window.addEventListener('scroll', () => {
      currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      const commentsTop = elem.getBoundingClientRect().top;
      // make sure the button is visible when scrolling to comments top
      if (commentsTop - menuHeight - toTopButton.offsetHeight < 0) {
        toTopButton.style.visibility = 'visible';
      } else {
        toTopButton.style.visibility = 'hidden';
      }
    });

    // back to top button click event
    toTopButton.addEventListener('click', function (event) {
      event.preventDefault(); //prevent default anchor behavior
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