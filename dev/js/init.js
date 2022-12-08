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
                const pageDataLoaded = init.populatePageData(actors)
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
        failure: () => {
            request.reject()
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
        `https://api.themoviedb.org/3/person/${actor1}?api_key=${API.key}&append_to_response=movie_credits,tv_credits`
    )
    const getActor2 = init.tmdbRequest(
        `https://api.themoviedb.org/3/person/${actor2}?api_key=${API.key}&append_to_response=movie_credits,tv_credits`
    )

    jq.$.when(getActor1, getActor2)
        .done((data1, data2) => {
            completed.resolve({
                actor1: data1,
                actor2: data2,
            })
        })
        .fail(() => {
            completed.reject()
        })

    return completed.promise()
}

function populatePageData(actors) {
    // Placeholder
    const completed = jq.$.Deferred()

    init.buildWidgets(actors)
    completed.resolve()

    return completed.promise()
}

function buildWidgets(actors) {
    const rolePopChart = vis.buildRolePopWidget(actors)
    $('#role-pop .chart').append(rolePopChart)
    const charts = vis.buildCreditTypeWidget(actors)
    $('#credit-type .chart').first().append(charts[0])
    $('#credit-type .chart').last().append(charts[1])
    // $('#revenue.chart').append(vis.buildRevenueWidget(actors))
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
    buildWidgets,
    initEventListeners,
    failLoad,
}

// Export reference to jquery so it can be accessed by sinon.
export const jq = {
    $,
}

// function retrievePastData() {
//     const completed = jq.$.Deferred()

//     const currentDate = new Date()

//     const threeDate = init.getDataDateStr(currentDate, 3)
//     const threePastUrl = `https://files.tmdb.org/p/exports/person_ids_${threeDate}.json.gz`
//     const threePast = init.tmdbRequest(threePastUrl, 'jsonp')

//     const twoDate = init.getDataDateStr(currentDate, 2)
//     const twoPastUrl = `https://files.tmdb.org/p/exports/person_ids_${twoDate}.json.gz`
//     const twoPast = init.tmdbRequest(twoPastUrl, 'jsonp')

//     const oneDate = init.getDataDateStr(currentDate, 1)
//     const onePastUrl = `https://files.tmdb.org/p/exports/person_ids_${oneDate}.json.gz`
//     const onePast = init.tmdbRequest(onePastUrl, 'jsonp')

//     jq.$.when(threePast, twoPast, onePast)
//         .done((data1, data2, data3) => {
//             completed.resolve({
//                 months: {threePast: data1, twoPast: data2, onePast: data3},
//             })
//         })
//         .fail(() => {
//             completed.reject()
//         })
// }

// function getDataDateStr(currentDate, monthOffset) {
//     let month = currentDate.getMonth() - monthOffset
//     let changeYear

//     if (month < 0) {
//         month = 11 - month
//         changeYear = true
//     }
//     month += 1
//     if (String(month).length === 1) {
//         month = `0${month}`
//     }

//     let day = currentDate.getDate()
//     if (String(day).length === 1) {
//         day = `0${day}`
//     }

//     let year = currentDate.getFullYear()
//     if (changeYear) {
//         year -= 1
//     }

//     return `${month}_${day}_${year}`
// }
