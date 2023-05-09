"use strict";
(() => {
    function waitForElem(selector, onceOnly = true) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
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
    function highlightMenuItem(item) {
        item.classList.add('iron-selected');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-selected', 'true');
    }
    function lowlightMenuItem(item) {
        item.classList.remove('iron-selected');
        item.setAttribute('tabindex', '-1');
        item.setAttribute('aria-selected', 'false');
    }
    let currentSelectedItem;
    let sortByBox;
    let sortByItems;
    (function (sortByItems) {
        sortByItems[sortByItems["TOP_COMMENTS"] = 0] = "TOP_COMMENTS";
        sortByItems[sortByItems["NEWEST_FIRST"] = 1] = "NEWEST_FIRST";
        sortByItems[sortByItems["MOST_LIKES"] = 2] = "MOST_LIKES";
        sortByItems[sortByItems["MOST_REPLIES"] = 3] = "MOST_REPLIES";
    })(sortByItems || (sortByItems = {}));
    ;
    waitForElem("#sort-menu").then((elem) => {
        const sortBySelector = "tp-yt-paper-listbox";
        const sortByItemTxtSelector = "div.item";
        sortByBox = elem.querySelector(sortBySelector);
        const menuItems = sortByBox.children;
        let lastSelectedItem = sortByItems.TOP_COMMENTS;
        currentSelectedItem = lastSelectedItem;
        const sortMenuBtn = elem;
        sortMenuBtn.addEventListener('click', () => {
            if (currentSelectedItem !== lastSelectedItem) {
                lowlightMenuItem(menuItems[lastSelectedItem]);
            }
            setTimeout(() => {
                menuItems[currentSelectedItem].children[0].focus();
            }, 100);
        });
        if (sortByBox.children.length === 3) {
            const likeItem = sortByBox.children[1].cloneNode(true);
            likeItem.querySelector(sortByItemTxtSelector).innerText = 'Most likes';
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
            const replyItem = sortByBox.children[1].cloneNode(true);
            replyItem.querySelector(sortByItemTxtSelector).innerText = 'Most replies';
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
        }
        ;
        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', () => {
                if (menuItems[currentSelectedItem] !== menuItems[i]) {
                    lowlightMenuItem(menuItems[currentSelectedItem]);
                    highlightMenuItem(menuItems[i]);
                    lastSelectedItem = currentSelectedItem;
                    currentSelectedItem = i;
                }
            });
        }
    });
    function nlikes(elem) {
        var _a;
        const likeBtn = elem.querySelector("#like-button button");
        const likes = likeBtn === null || likeBtn === void 0 ? void 0 : likeBtn.getAttribute("aria-label").match(/[\d,]+/g);
        return parseInt(((_a = likes === null || likes === void 0 ? void 0 : likes[0]) === null || _a === void 0 ? void 0 : _a.replace(/,/g, '')) || '0');
    }
    function nreplies(elem) {
        var _a;
        const replyBtn = elem.querySelector("#more-replies button");
        const replies = replyBtn === null || replyBtn === void 0 ? void 0 : replyBtn.getAttribute("aria-label").match(/[\d,]+/g);
        return parseInt(((_a = replies === null || replies === void 0 ? void 0 : replies[0]) === null || _a === void 0 ? void 0 : _a.replace(/,/g, '')) || '0');
    }
    const commentSelector = "ytd-comment-thread-renderer";
    const contentsSelector = "#comments #contents";
    function sortComments(callback) {
        function compare(firstEl, secondEl) {
            return callback(secondEl) - callback(firstEl);
        }
        const contents = document.querySelector(contentsSelector);
        if (contents) {
            const comments = Array.from(contents.querySelectorAll(commentSelector));
            comments.sort(compare);
            const lastChild = contents.lastChild;
            while (contents.firstChild) {
                contents.removeChild(contents.firstChild);
            }
            for (const comment of comments) {
                contents.appendChild(comment);
            }
            contents.appendChild(lastChild);
        }
    }
    waitForElem(contentsSelector).then((elem) => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'YTD-CONTINUATION-ITEM-RENDERER') {
                            observer.disconnect();
                            if (currentSelectedItem === sortByItems.MOST_LIKES) {
                                sortComments(nlikes);
                            }
                            else if (currentSelectedItem === sortByItems.MOST_REPLIES) {
                                sortComments(nreplies);
                            }
                            observer.observe(elem, { childList: true });
                        }
                    });
                }
            });
        });
        observer.observe(elem, { childList: true });
    });
    waitForElem('#comments').then(elem => {
        var _a, _b;
        console.log(elem);
        const toTopButton = document.createElement('top-button');
        toTopButton.className = 'back-to-top';
        toTopButton.innerHTML = '<div class="arrow-up"></div>';
        let arrowDirection = 'up';
        elem.insertAdjacentElement("afterend", toTopButton);
        const commentsWidth = ((_a = toTopButton.parentElement) === null || _a === void 0 ? void 0 : _a.offsetWidth) - 13;
        const menuHeight = (_b = document.querySelector('#masthead')) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect().height;
        toTopButton.style.transform += `translateX(${commentsWidth}px)`;
        let currentScrollTop = 0;
        let previousScrollTop = 0;
        window.addEventListener('scroll', () => {
            currentScrollTop = window.scrollY || document.documentElement.scrollTop;
            const commentsTop = elem.getBoundingClientRect().top;
            if (commentsTop - menuHeight - toTopButton.offsetHeight < 0) {
                toTopButton.style.visibility = 'visible';
            }
            else {
                toTopButton.style.visibility = 'hidden';
            }
        });
        toTopButton.addEventListener('click', function (event) {
            var _a;
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
                const header = (_a = elem.querySelector('#header')) === null || _a === void 0 ? void 0 : _a.children[0];
                const style = window.getComputedStyle(header);
                const marginTop = parseInt(style.getPropertyValue('margin-top'));
                const scrollY = elemTop - menuHeight - marginTop;
                setTimeout(() => {
                    window.scrollTo({ top: scrollY, left: 0, behavior: 'smooth' });
                }, 200);
                toTopButton.style.transform += 'rotate(180deg)';
                arrowDirection = 'down';
            }
        });
    });
})();
