// ==UserScript==
// @name         FBM Autofill
// @downloadUrl  https://raw.githubusercontent.com/ryanclanigan/TamperMonkeyScripts/main/FBMAutofill.js
// @version      0.3
// @author       ryanclanigan
// @description  Allow speadier input of FBM listings
// @match        https://www.facebook.com/marketplace/create/item
// @run-at       document-idle
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  function getElementContainingText(text, skips = 0) {
    var iterator = document.evaluate("//span[contains(., '" + text + "')]", document, null, XPathResult.ANY_TYPE, null)
    var maybeNull = iterator.iterateNext();
    while (skips > 0) {
      maybeNull = iterator.iterateNext();
      skips--;
    }
    return maybeNull;
  }


  function getElementThatEqualsText(text) {
    var maybeNull = document.evaluate("//span[text()='" + text + "']", document, null, XPathResult.ANY_TYPE, null)
      .iterateNext();
    return maybeNull;
  }

  function getElementAfterElementContainingText(text) {
    var maybeNull = getElementContainingText(text);
    return maybeNull ? maybeNull.nextElementSibling : undefined;
  }

  function waitForElmAfter(text) {
    return new Promise(resolve => {
      if (getElementAfterElementContainingText(text)) {
        return resolve(getElementAfterElementContainingText(text));
      }

      const observer = new MutationObserver(mutations => {
        if (getElementAfterElementContainingText(text)) {
          resolve(getElementAfterElementContainingText(text));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  function waitForElm(text, skips = 0) {
    return new Promise(resolve => {
      if (getElementContainingText(text, skips)) {
        return resolve(getElementContainingText(text, skips));
      }

      const observer = new MutationObserver(mutations => {
        if (getElementContainingText(text, skips)) {
          resolve(getElementContainingText(text, skips));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  function waitForElmExactly(text) {
    return new Promise(resolve => {
      if (getElementThatEqualsText(text)) {
        return resolve(getElementThatEqualsText(text));
      }

      const observer = new MutationObserver(mutations => {
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

  function setReactInputValue(input, value) {
    // Get the original prototype methods
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    
    // Set the value directly
    nativeInputValueSetter.call(input, value);
    
    // Create and dispatch events that React listens for
    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });
    
    input.dispatchEvent(inputEvent);
    input.dispatchEvent(changeEvent);
  }

  waitForElmAfter('Description').then(elem => {
    elem.onpaste = async () => {
      var condition = await waitForElm('Condition');
      condition.click();
      var good = await waitForElm('Used - Good');
      good.click();

      (await waitForElmAfter('Category')).click();
      (await waitForElm("Video Games & Consoles")).click();
      (await waitForElmExactly("Video Games")).click();

      var title = (await waitForElmAfter('Title')).value;
      (await waitForElm('Platform')).click();
      await sleep(1000);
      var threeDO = getElementThatEqualsText('3DO');
      var next = threeDO?.parentElement?.parentElement?.parentElement?.parentElement;
      while (next) {
        if (title.includes(next.innerText)) {
          next.click();
          break;
        }
        next = next.nextElementSibling;
      }

      (await waitForElm("Next")).click();

      var deliveryButton = await waitForElm("Delivery method", 1);
      await sleep(1500);
      deliveryButton.click();
      (await waitForElm("Local pickup")).click();
      (await waitForElm("Shipping")).click();
      var shippingRate = await waitForElmAfter("Shipping rate");
      setReactInputValue(shippingRate, '5');

      await sleep(2000);
      (await waitForElm("Next")).click();
      await sleep(1000);
      (await waitForElm("Publish")).click();
    };
  });
})();
