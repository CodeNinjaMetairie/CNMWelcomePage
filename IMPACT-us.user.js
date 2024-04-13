// ==UserScript==
// @name         Impact Tools
// @namespace    https://codeninjametairie.github.io/
// @version      0.6.0
// @description  Various Tweaks to the IMPACT Site
// @author       CNM
// @match        *://impact.codeninjas.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.user.js
// @downloadURL  https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.user.js
// @grant        unsafeWindow
// @grant        window.onurlchange
// ==/UserScript==

const version = '0.6.0';

const overlayHTML = `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgb(37 37 67 / 50%);z-index:1000;" id="cnm-submit-confirm">
    <div
        style="background:#00f;width:60%;margin:auto;height:80%;border-radius:30px;margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">
        <div style="text-align:center;font-size:2em;font-weight:700;line-height:1.2em;margin:0;padding:75px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80%">
        <div style="font-size:64px">Hey there!</div>
        <div style="margin:55px 45px 0 45px">This project requires sensei approval to submit. Ask a sensei for approval
            to continue.</div>
        <br>
        <input
            style="margin-top:10px;border-radius:5px;background:#add8e6;border:none;font-size:.8em;font-style:italic;padding:10px"
            type="password" id="cnm-submit-password" placeholder="Secret sensei secret" autocomplete="off">
        <input
            style="margin-top:10px;margin-left:5px;border-radius:5px;background:#add8e6;border:none;font-size:.8em;font-style:normal 900 23px/30px azo-sans-web;padding:10px;font-weight:600"
            type="submit" id="cnm-submit-confirm-button" value="Approve">
        </div>
        <div id="cnm-submit-confirm-close-button" style="font-size:32px;color:#9797c6;position:absolute;right:35px;top:2%;font-weight:600;cursor:pointer;">X</div>
    </div>
</div>`;

let lastHref = window.location.href;

const main = function() {
    'use strict';
    log(`Init CNM help script V${version} on ${window.location.href}`);

    perPage();
    function callPerPageIfChanged() {
        if (window.location.href !== lastHref) {
            log('Navigated to: ' + window.location.href);
            lastHref = window.location.href;
            perPage();
        }
    }
    window.navigation.addEventListener("navigate", callPerPageIfChanged);

    window.addEventListener('urlchange', callPerPageIfChanged);

    /*addEventListener("load", (event) => {
        const homeButton = document.querySelector('body > app-root > ng-component > main > div > app-login-form > div > div > form > div.login-at-home > div');

        if (homeButton?.innerText.includes('LOG IN AT HOME')) {
            homeButton.remove(); // Remove the button for now due to issues
        }});*/

    let documentObserver = new MutationObserver((mutations) => {
        const senseiBtn = document.querySelector('.sensei-btn');
        if (senseiBtn && !senseiBtn.hasBeepHandler) {
            log("CNM: Found sensei-btn");
            senseiBtn.hasBeepHandler = true;
            //documentObserver.disconnect();
            let btnObserver = new MutationObserver((mutations) => {
                const name = document.querySelector('.bottom-username').innerText.trim();
                if (senseiBtn.classList.contains('sensei-help')) {
                    fetch(`https://crmzoom.com:3000/needhelp?name=${name}`);
                } else {
                    fetch(`https://crmzoom.com:3000/donehelp?name=${name}`);
                }
            });
            btnObserver.observe(senseiBtn, {attributes: true, childList: false, characterData: false, subtree: false});
        }
        makeSubmitOverlay();
    });
    documentObserver.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});
}

try {
    main();
} catch (e) {
    log(e.toString())
}

function makeSubmitOverlay() {
    let updateOnly = false;
    const submitBtn = Array.from(document.querySelectorAll(`button.nav-btn-green`)).filter(e => e.innerHTML.includes('SUBMIT'))[0];
    if (document.getElementById('cnm-submit-overlay')) {
        if (!submitBtn) {
            document.getElementById('cnm-submit-overlay').remove();
        } else {
            updateOnly = true;
        }
    }
    if (!submitBtn) {
        return;
    }

    const submitOverlay = updateOnly ? document.getElementById('cnm-submit-overlay') : document.createElement('div');
    const bodyRect = document.body.getBoundingClientRect();
    const submitRect = submitBtn.getBoundingClientRect();
    submitOverlay.id = 'cnm-submit-overlay';
    submitOverlay.style.position = 'fixed';
    submitOverlay.style.top = submitRect.top - bodyRect.top + 'px';
    submitOverlay.style.left = submitRect.left - bodyRect.left + 'px';
    submitOverlay.style.width = submitRect.right - submitRect.left + 'px';
    submitOverlay.style.height = submitRect.bottom - submitRect.top + 'px';

    if (updateOnly) {
        return;
    }

    submitOverlay.style.cursor = 'pointer';
    //submitOverlay.style.background = 'blue';
    submitOverlay.onclick = (e) => {
        if (shouldRequireSenseiApproval()) {
            // Exit if already submitting
            log('Submit button disabled: ' + submitBtn.disabled)
            if (submitBtn.disabled) {
                return;
            }
            log("CNM: Stopping submission");
            document.body.insertAdjacentHTML('beforeend', overlayHTML);
            const confirmButton = document.getElementById('cnm-submit-confirm-button');
            const passwordInput = document.getElementById('cnm-submit-password');
            passwordInput.onkeyup = (event) => {
                if (event.keyCode === 13) {
                    confirmButton.click();
                }
            }
            confirmButton.onclick = () => {
                if (passwordInput.value === 'hithere') {
                    document.getElementById('cnm-submit-confirm').remove();
                    submitBtn.click();
                } else {
                    window.alert('Password incorrect');
                }
            }
            const closeButton = document.getElementById('cnm-submit-confirm-close-button');
            closeButton.onclick = () => {
                document.getElementById('cnm-submit-confirm').remove();
            }
            e.stopPropagation();
        } else {
            submitBtn.click();
        }
    }
    new ResizeObserver(makeSubmitOverlay).observe(submitBtn);
    document.body.appendChild(submitOverlay);
}

function shouldRequireSenseiApproval() {
    // We rather a false negative here than a false positive. Thus we check both for the presence of
    // a non-disabled requirements star and the Quest title.
    const titleContainer = document.querySelector('.title-container');
    if (!titleContainer?.querySelector('h1')?.innerText.startsWith('Quest:')) { // startsWith in case of a title like 'Adventure: Ninja Quest'
        return false;
    }
    if (window.location.pathname !== '/level/project/activity') {
        return false;
    }
    const requirementsStar = document.querySelector(`[style="--icon-background: url('/assets/requirement.svg');"]`);
    if (requirementsStar && requirementsStar.getAttribute("disabled") === "false") {
        return true;
    }
}

// Function will be called at least once per URL change but could be called more often.
// Therefore it should behave absolutely.
// If we reload, we'll usually do this twice, as the url will change from start to something else and back again.
async function perPage() {
    if (window.location.pathname === '/login') {
        if (!document.getElementById('cnm-version-holder')) {
            const versionDiv = document.createElement('div');
            versionDiv.id = 'cnm-version-holder';
            versionDiv.innerHTML = `${version}`;
            versionDiv.style = 'position: fixed;bottom: 0px;right: 0px;font-size: 16px;color: #4d4d9a;';
            document.body.appendChild(versionDiv);
        }
    } else {
        document.getElementById('cnm-version-holder')?.remove();
    }

    const splitPath = window.location.pathname.split('/');
    if (splitPath[1] === 'level' && splitPath[splitPath.length - 1] === 'activity') {
        /* Horribly hacky: as we can't reliably determine this using onload or anything else, wait until
        name exists. Could use a MutationObserver. */
        while (!document.querySelector('.bottom-username')) {
            await (new Promise(res => setTimeout(res, 100)));
        }
        const name = document.querySelector('.bottom-username').innerText.trim();
        const titleContainer = document.querySelector('.title-container');
        const beltName = titleContainer.children[0].innerText.slice(0, titleContainer.children[0].innerText.indexOf(' / '));
        const levelName = titleContainer.children[0].innerText.slice(titleContainer.children[0].innerText.indexOf(' / ') + ' / '.length);
        const activityName = titleContainer.children[1].innerText.trim();

        fetch(`https://crmzoom.com:3001/activitylog?name=${name}`, {
            method: 'PATCH',
            body: JSON.stringify({
                beltName: beltName,
                levelName: levelName,
                activityName: activityName
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
    }
}

function log(msg) {
    if (unsafeWindow.___cnm__log_messages_ignore) {
        unsafeWindow.___cnm__log_messages_ignore.push(msg);
    } else {
        unsafeWindow.___cnm__log_messages_ignore = [msg]
    }
}
