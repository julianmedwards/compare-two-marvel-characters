'use strict'

import $ from 'jquery'

function initialize() {
    const APIRequest = init.retrieveAPIKeys()
    APIRequest.done((API) => {
        const pageDataLoaded = init.populatePageData(API)
        pageDataLoaded
            .done(() => {
                init.initEventListeners(API)
            })
            .fail(init.failLoad)
    }).fail(init.failLoad)
}

function failLoad() {
    window.alert(
        'Unable to load page data. Please try again or contact julian.michael.edwards@gmail.com'
    )
}

function retrieveAPIKeys() {
    const request = $.Deferred()

    $.getJSON('./config.json', function (data) {
        const API = {key: data.tmdbAPIKey, RAToken: data.tmdbReadAccessToken}
        request.resolve(API)
    }).fail(() => {
        console.error('Could not retrieve API keys!')
        request.reject()
    })

    return request.promise()
}

function populatePageData() {
    // Placeholder
    const request = $.Deferred()

    request.resolve()

    return request.promise()
}

function initEventListeners() {
    // Placeholder
}

export const init = {
    initialize,
    retrieveAPIKeys,
    populatePageData,
    initEventListeners,
    failLoad,
}

export const testRefs = {
    $,
}
