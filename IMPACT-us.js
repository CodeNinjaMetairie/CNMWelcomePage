// ==UserScript==
// @name         Impact Tools
// @namespace    https://codeninjametairie.github.io/
// @version      0.5.1
// @description  Various Tweaks to the IMPACT Site
// @author       CNM
// @match        *://impact.codeninjas.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.js
// @downloadURL  https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.js
// @grant        none
// ==/UserScript==

const version = '0.5.1';

const overlayHTML = `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgb(37 37 67 / 50%)" id="cnm-submit-confirm">
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

(function() {
    'use strict';

    /*addEventListener("load", (event) => {
        const homeButton = document.querySelector('body > app-root > ng-component > main > div > app-login-form > div > div > form > div.login-at-home > div');
        console.log(`Init CNM help script V${version}`);
        if (homeButton?.innerText.includes('LOG IN AT HOME')) {
            homeButton.remove(); // Remove the button for now due to issues
        }});*/

    let documentObserver = new MutationObserver((mutations) => {
        const senseiBtn = document.querySelector('.sensei-btn');
        if (senseiBtn && !senseiBtn.hasBeepHandler) {
            console.log("CNM: Found sensei-btn");
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
})();

function makeSubmitOverlay() {
    const submitBtn = Array.from(document.querySelectorAll(`button.nav-btn-green`)).filter(e => e.innerHTML.includes('SUBMIT'))[0];
    if (document.getElementById('cnm-submit-overlay')) {
        if (!submitBtn) {
            document.getElementById('cnm-submit-overlay').remove();
        } else {
            return;
        }
    }
    if (!submitBtn) {
        return;
    }
    console.log("CNM: Found submit button");
    const submitOverlay = document.createElement('div');
    const bodyRect = document.body.getBoundingClientRect();
    const submitRect = submitBtn.getBoundingClientRect();
    submitOverlay.id = 'cnm-submit-overlay';
    submitOverlay.style.position = 'fixed';
    submitOverlay.style.top = submitRect.top - bodyRect.top + 'px';
    submitOverlay.style.left = submitRect.left - bodyRect.left + 'px';
    submitOverlay.style.width = submitRect.right - submitRect.left + 'px';
    submitOverlay.style.height = submitRect.bottom - submitRect.top + 'px';
    submitOverlay.style.cursor = 'pointer';
    //submitOverlay.style.background = 'blue';
    submitOverlay.onclick = (e) => {
        if (shouldRequireSenseiApproval()) {
            console.log("CNM: Stopping submission");
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
    new ResizeObserver(makeSubmitOverlay).observe(submitOverlay);
    document.body.appendChild(submitOverlay);
}

function shouldRequireSenseiApproval() {
    // We rather a false negative here than a false positive. Thus we check both for the presence of
    // a non-disabled requirements star and the Quest title.
    const titleContainer = document.querySelector('.title-container');
    if (!titleContainer?.querySelector('h1')?.innerText.startsWith('Quest:')) { // startsWith in case of a title like 'Adventure: Ninja Quest'
        return false;
    }
    const requirementsStar = document.querySelector(`[style="--icon-background: url('/assets/requirement.svg');"]`);
    if (requirementsStar && requirementsStar.getAttribute("disabled") === "false") {
        return true;
    }
}
