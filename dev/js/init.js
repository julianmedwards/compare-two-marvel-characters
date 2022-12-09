'use strict'

import $ from 'jquery'
import {vis} from './visualization.js'

function initialize() {
    const APIRequest = init.retrieveAPIKeys()
    APIRequest.done((API) => {
        let actor1 = '3223'
        let actor2 = '71580'
        let mcuKeyword = '180547'
        const actorRequest = init.retrieveActorData(
            API,
            actor1,
            actor2,
            mcuKeyword
        )
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

function retrieveActorData(API, actor1, actor2, keyword) {
    const completed = jq.$.Deferred()

    const getActor1 = init.tmdbRequest(
        `https://api.themoviedb.org/3/person/${actor1}?api_key=${API.key}&append_to_response=movie_credits,tv_credits`
    )
    const getActor2 = init.tmdbRequest(
        `https://api.themoviedb.org/3/person/${actor2}?api_key=${API.key}&append_to_response=movie_credits,tv_credits`
    )
    const getMarvelItems = init.retrieveMarvelItems(API, keyword)

    jq.$.when(getActor1, getActor2, getMarvelItems)
        .done((actor1Data, actor2Data, marvelData) => {
            completed.resolve({
                actor1: actor1Data,
                actor2: actor2Data,
                marvelItems: marvelData,
            })
        })
        .fail(() => {
            completed.reject()
        })

    return completed.promise()
}

function retrieveMarvelItems(API, keyword) {
    const completed = jq.$.Deferred()

    const getMarvelMovies = init.requestAllPages(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API.key}&sort_by=release_date.desc&include_adult=false&include_video=false&with_keywords=${keyword}`
    )

    const getMarvelSeries = init.requestAllPages(
        `https://api.themoviedb.org/3/discover/tv?api_key=${API.key}&sort_by=release_date.desc&include_adult=false&include_video=false&with_keywords=${keyword}`
    )

    jq.$.when(getMarvelMovies, getMarvelSeries)
        .done((movieData, seriesData) => {
            completed.resolve({
                movies: movieData,
                series: seriesData,
            })
        })
        .fail(() => {
            // Could actually just fail one widget
            completed.reject()
        })

    return completed.promise()
}

function requestAllPages(url, count = 1, items = []) {
    const completed = jq.$.Deferred()

    const allPagesRequest = requestPage(url, count, items)
    allPagesRequest.done((data) => {
        completed.resolve(data)
    })

    return completed.promise()
}

function requestPage(url, count, items) {
    const completed = jq.$.Deferred()

    const requestPage = init.tmdbRequest(`${url}&page=${count}`)
    requestPage.done((data) => {
        items = items.concat(data.results)
        if (data.total_pages > count) {
            const nextPage = init.requestPage(url, count + 1, items)
            nextPage.done((items) => {
                completed.resolve(items)
            })
        } else {
            completed.resolve(items)
        }
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

    const creditCountChart = vis.buildCreditCountWidget(actors)
    $('#credit-count .chart').append(creditCountChart)
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
    retrieveMarvelItems,
    requestAllPages,
    requestPage,
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
