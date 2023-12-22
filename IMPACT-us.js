// ==UserScript==
// @name         Impact Tools
// @namespace    https://codeninjametairie.github.io/
// @version      0.3
// @description  Various Tweaks to the IMPACT Site
// @author       CNM
// @match        *://impact.codeninjas.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.js
// @downloadURL  https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.js
// @grant        none
// ==/UserScript==

const version = '0.3';

(function() {
    'use strict';

    addEventListener("load", (event) => {
        const homeButton = document.querySelector('body > app-root > ng-component > main > div > app-login-form > div > div > form > div.login-at-home > div');
        console.log(`Init CNM help script V${version}`);
        if (homeButton?.innerText.includes('LOG IN AT HOME')) {
            homeButton.remove(); // Remove the button for now due to issues
        }});

    let documentObserver = new MutationObserver((mutations) => {
        const senseiBtn = document.querySelector('.sensei-btn');
        if (senseiBtn) {
            console.log("Found sensei-btn");
            documentObserver.disconnect();
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
    });
    documentObserver.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});
})();
