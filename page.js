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
    waitForElem("#sort-menu").then((elem) => {
        const sortBySelector = "tp-yt-paper-listbox";
        const sortByItemTxtSelector = "div.item";
        sortByBox = elem.querySelector(sortBySelector);
        let lastSelectedItem = sortByBox.children[0];
        currentSelectedItem = lastSelectedItem;
        const sortMenuBtn = document.querySelector("#sort-menu");
        sortMenuBtn === null || sortMenuBtn === void 0 ? void 0 : sortMenuBtn.addEventListener('click', () => {
            if (currentSelectedItem !== lastSelectedItem) {
                lowlightMenuItem(lastSelectedItem);
                lastSelectedItem = currentSelectedItem;
            }
        });
        if (sortByBox.children.length === 3) {
            const likeItem = sortByBox.children[1].cloneNode(true);
            likeItem.querySelector(sortByItemTxtSelector).innerText = 'Most likes';
            sortByBox.children[1].insertAdjacentElement('afterend', likeItem);
            likeItem.addEventListener('click', () => {
                sortComments(nlikes);
                setTimeout(() => sortMenuBtn.click(), 500);
            });
            const replyItem = sortByBox.children[1].cloneNode(true);
            replyItem.querySelector(sortByItemTxtSelector).innerText = 'Most replies';
            sortByBox.children[2].insertAdjacentElement('afterend', replyItem);
            replyItem.addEventListener('click', () => {
                sortComments(nreplies);
                setTimeout(() => sortMenuBtn.click(), 500);
            });
        }
        ;
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
    function nlikes(elem) {
        var _a;
        const likeBtnSelector = "#like-button button";
        const likeBtn = elem.querySelector(likeBtnSelector);
        const likes = (_a = likeBtn.getAttribute("aria-label")) === null || _a === void 0 ? void 0 : _a.split(' ')[5].split(',');
        return parseInt(likes.join(''));
    }
    function nreplies(elem) {
        var _a;
        const replyBtnSelector = "#more-replies button";
        const replyBtn = elem.querySelector(replyBtnSelector);
        if (!replyBtn)
            return 0;
        const replies = (_a = replyBtn.getAttribute("aria-label")) === null || _a === void 0 ? void 0 : _a.split(' ')[0].split(',');
        return parseInt(replies.join(''));
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
    function isMultipleof21(num) {
        return num % 21 == 0;
    }
    waitForElem(contentsSelector).then((elem) => {
        let count = 0;
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                count += mutation.addedNodes.length;
            });
            if (count !== 21 && isMultipleof21(count)) {
                observer.disconnect();
                if (currentSelectedItem === sortByBox.children[2]) {
                    sortComments(nlikes);
                }
                else if (currentSelectedItem === sortByBox.children[3]) {
                    sortComments(nreplies);
                }
                console.log('count is ' + count);
                observer.observe(elem, { childList: true });
            }
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
