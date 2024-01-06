// ==UserScript==
// @name         FBM Refresher
// @downloadUrl  https://raw.githubusercontent.com/ryanclanigan/TamperMonkeyScripts/main/FBMRefresher.js
// @version      0.2
// @author       ryanclanigan
// @description  Allows automatic refreshing of FBM listings
// @match        https://www.facebook.com/marketplace/selling/renew_listings/
// @run-at       document-idle
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  function getElementThatEqualsText(text) {
    var maybeNull = document.evaluate("//span[text()='" + text + "']", document, null, XPathResult.ANY_TYPE, null)
      .iterateNext();
    return maybeNull;
  }

  function waitForElmExactly(text) {
    return new Promise(resolve => {
      if (getElementThatEqualsText(text)) {
        return resolve(getElementThatEqualsText(text));
      }

      const observer = new MutationObserver(_ => {
        if (getElementThatEqualsText(text)) {
          resolve(getElementThatEqualsText(text));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  // Refresh the page if a day passes
  setTimeout(() => {
    window.location.reload();
  }, 86_400_000)

  waitForElmExactly('Renew').then(async () => {
    var elem = getElementThatEqualsText('Renew');
    while (!!elem) {
      try {
        elem.click();
      } catch (e) {
        // do nothing in case element disappears
      }
      elem = getElementThatEqualsText('Renew');
      await sleep(1000);
    }

    window.location.reload();
  });
})();
