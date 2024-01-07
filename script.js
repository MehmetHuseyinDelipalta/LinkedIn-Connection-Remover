// ==UserScript==
// @name         LinkedIn Connection Remover
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Remove a LinkedIn Connection with a single click.
// @author       @mehmethuseyindelipalta
// @match        https://www.linkedin.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const removeConnection = async (dropdown) => {
        const dropdownTrigger = dropdown.querySelector('.mn-connection-card__dropdown-trigger');

        if (!dropdownTrigger) return;

        dropdownTrigger.click();
        await waitForElement('.artdeco-dropdown__content-inner ul li div button');
        const secondTargetEl = dropdown.querySelector('.artdeco-dropdown__content-inner ul li div button');
        secondTargetEl.click();

        await waitForElement('.artdeco-modal .artdeco-button--primary.ember-view');
        const thirdTargetEl = document.querySelector('.artdeco-modal .artdeco-button--primary.ember-view');
        thirdTargetEl.click();
    };

    const waitForElement = (selector) => {
        return new Promise((resolve) => {
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve();
                } else {
                    requestAnimationFrame(checkElement);
                }
            };
            checkElement();
        });
    };

    const observeDropdowns = (addedNodes) => {
        addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains('mn-connection-card__dropdown')) {
                if (!node.classList.contains('connectioner-added')) {
                    node.classList.add('connectioner-added');
                    node.querySelectorAll('.artdeco-button--danger').forEach((button) => {
                        button.remove();
                    });
                    addShortcutButton(node);
                }
            }
        });
    };

    const addShortcutButton = (dropdown) => {
        const shortcutBtn = document.createElement('button');
        shortcutBtn.textContent = 'Sil';
        shortcutBtn.className = 'artdeco-button artdeco-button--danger';
        shortcutBtn.addEventListener('click', async () => {
            shortcutBtn.disabled = true;
            await removeConnection(dropdown);
            shortcutBtn.disabled = false;
        });
        dropdown.appendChild(shortcutBtn);
    };

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                observeDropdowns(mutation.addedNodes);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    observeDropdowns(document.querySelectorAll('.mn-connection-card__dropdown'));
})();