// ==UserScript==
// @name         Teamcity Ctrl left and right
// @downloadUrl  https://raw.githubusercontent.com/ryanclanigan/TampermonkeyScripts/main/TeamcityLeftRightBuilds.js
// @version      0.1
// @author       ryanclanigan
// @description  Allow using ctrl+left/right arrow to navigate between teamcity builds
// @include      http://teamcity.*.*/buildConfiguration/*
// @include      https://teamcity.*.*/buildConfiguration/*
// @run-at       document-idle
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const arrow = { left: 37, right: 39 };

    function clickBuildArrowWithCtrlArrow(e, arrowCode, elem) {
      const keyCode = e.keyCode || e.which;
      if (e.ctrlKey && keyCode === arrowCode) {
        elem.click();
      }
    }

    // From https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
    function waitForElm(selector) {
      return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
      });
    }

    waitForElm('a[Title="Previous build"]').then(elem => {
        document.addEventListener('keydown', function(e) {
            clickBuildArrowWithCtrlArrow(e, arrow.left, elem);
        });
    });
    waitForElm('a[Title="Next build"]').then(elem => {
        document.addEventListener('keydown', function(e) {
            clickBuildArrowWithCtrlArrow(e, arrow.right, elem);
        });
    });
})();
