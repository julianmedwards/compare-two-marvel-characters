'use strict'

import $ from 'jquery'

function initialize() {
    const API = {}
    const APIRequest = init.retrieveAPIKeys(API)
    APIRequest.done((API) => {
        const pageDataLoaded = init.populatePageData(API)
        pageDataLoaded.done(() => {
            init.initEventListeners(API)
        })
    })
    // .fail(() => {
    //     alert(
    //         'Unable to load page data. Please try again or contact julian.michael.edwards@gmail.com'
    //     )
    // })
}

function retrieveAPIKeys(API) {
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
}

export const jqRef = {
    $,
}
