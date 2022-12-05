'use strict'

import $ from 'jquery'
import {vis} from './visualization.js'

function initialize() {
    const APIRequest = init.retrieveAPIKeys()
    APIRequest.done((API) => {
        let actor1 = '3223'
        let actor2 = '71580'
        const actorRequest = init.retrieveActorData(API, actor1, actor2)
        actorRequest
            .done((actors) => {
                console.log(actors)
                const pageDataLoaded = init.populatePageData(API, actors)
                pageDataLoaded
                    .done(() => {
                        init.initEventListeners(API)
                    })
                    .fail(init.failLoad)
            })
            .fail(init.failLoad)
    }).fail(init.failLoad)
}

function failLoad() {
    window.alert(
        'Unable to load page data. Please try again or contact julian.michael.edwards@gmail.com'
    )
}

function tmdbRequest(url) {
    const request = jq.$.Deferred()

    jq.$.get({
        url: url,
        success: (data) => {
            request.resolve(data)
        },
    })

    return request.promise()
}

function retrieveAPIKeys() {
    const request = jq.$.Deferred()

    $.getJSON('./config.json', function (data) {
        const API = {key: data.tmdbAPIKey, RAToken: data.tmdbReadAccessToken}
        request.resolve(API)
    }).fail(() => {
        console.error('Could not retrieve API keys!')
        request.reject()
    })

    return request.promise()
}

function retrieveActorData(API, actor1, actor2) {
    const completed = jq.$.Deferred()

    const getActor1 = init.tmdbRequest(
        `https://api.themoviedb.org/3/person/${actor1}?api_key=${API.key}`
    )
    const getActor2 = init.tmdbRequest(
        `https://api.themoviedb.org/3/person/${actor2}?api_key=${API.key}`
    )

    jq.$.when(getActor1, getActor2).done((data1, data2) => {
        completed.resolve({actor1: data1, actor2: data2})
    })

    return completed.promise()
}

function populatePageData() {
    // Placeholder
    const completed = jq.$.Deferred()

    completed.resolve()

    return completed.promise()
}

function initEventListeners() {
    // Placeholder
}

export const init = {
    initialize,
    tmdbRequest,
    retrieveAPIKeys,
    retrieveActorData,
    populatePageData,
    initEventListeners,
    failLoad,
}

// Export reference to jquery so it can be accessed by sinon.
export const jq = {
    $,
}
