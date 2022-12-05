'use strict'

import $ from 'jquery'
import {vis} from './visualization.js'

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

    $.get({
        url: `https://api.themoviedb.org/3/person/18918/changes?api_key=2f53ed057a5040f94bf52c398ed4a659&page=1`,
        success: (data) => {
            console.log(data)
        },
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
    vis.entry()
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
