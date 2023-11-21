// ==UserScript==
// @name         Impact Tools
// @namespace    https://codeninjametairie.github.io/
// @version      0.1
// @description  Various Tweaks to the IMPACT Site
// @author       CNM
// @match        *://impact.codeninjas.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.js
// @downloadURL  https://raw.githubusercontent.com/CodeNinjaMetairie/CNMWelcomePage/main/IMPACT-us.js
// @grant        none
// ==/UserScript==

const version = '0.1';

(function() {
    'use strict';

    addEventListener("load", (event) => {
        const homeButton = document.querySelector('body > app-root > ng-component > main > div > app-login-form > div > div > form > div.login-at-home > div');
        console.log(`Init CNM help script V${version}`);
        if (homeButton?.innerText.includes('LOG IN AT HOME')) {
            homeButton.remove();
        }});
})();
