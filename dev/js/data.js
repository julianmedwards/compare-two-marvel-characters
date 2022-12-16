'use strict'

import {count} from 'd3'

function getPopularRolesData(actor) {
    let roles = actor.movie_credits.cast
    roles.sort(data.compareActorPopularity)

    roles = roles.reduce(function (p, c) {
        if (
            !p.some(function (el) {
                return data.compareCharacterName(el.character, c.character)
            })
        )
            p.push(c)
        return p
    }, [])

    roles = roles.slice(0, 5)

    return roles.map((el) => {
        el.actor = actor.id
        return el
    })
}

function compareActorPopularity(a, b) {
    return b.popularity - a.popularity
}

function compareCharacterName(char1, char2) {
    if (char1 === char2) {
        return true
    }

    char1 = char1.split(' ')
    char2 = char2.split(' ')

    const sameNames = char1.filter((value) => char2.includes(value))

    if (sameNames.length > 1) {
        return true
    }

    return false
}

function getCreditTypeData(actor) {
    const credits = [
        {name: 'Film Actor', value: actor.movie_credits.cast.length},
        {name: 'TV Actor', value: actor.tv_credits.cast.length},
        {name: 'Film Production', value: actor.movie_credits.crew.length},
        {name: 'TV Production', value: actor.tv_credits.crew.length},
    ]
    credits.columns = ['name', 'values']
    return credits
}

function getCreditCountData(actor1, actor2, marvelItems) {
    const actor1Credits = data.separateMarvelCredits(
        actor1.movie_credits.cast,
        actor1.tv_credits.cast,
        marvelItems
    )
    const actor2Credits = data.separateMarvelCredits(
        actor2.movie_credits.cast,
        actor2.tv_credits.cast,
        marvelItems
    )

    const credits = {}
    credits.movies = [
        {
            actor: actor1.name,
            count: actor1Credits.movieStd,
            type: 'Movie Roles',
        },
        {
            actor: actor1.name,
            count: actor1Credits.movieMrvl,
            type: 'Marvel Movies',
        },
        {
            actor: actor2.name,
            count: actor2Credits.movieStd,
            type: 'Movie Roles',
        },
        {
            actor: actor2.name,
            count: actor2Credits.movieMrvl,
            type: 'Marvel Movies',
        },
    ]
    credits.series = [
        {
            actor: actor1.name,
            count: actor1Credits.tvStd,
            type: 'TV Roles',
        },
        {
            actor: actor1.name,
            count: actor1Credits.tvMrvl,
            type: 'Marvel Series',
        },

        {
            actor: actor2.name,
            count: actor2Credits.tvStd,
            type: 'TV Roles',
        },
        {
            actor: actor2.name,
            count: actor2Credits.tvMrvl,
            type: 'Marvel Series',
        },
    ]

    return credits
}

function separateMarvelCredits(movieCredits, tvCredits, marvelItems) {
    let movieStd, movieMrvl, tvStd, tvMrvl

    const marvelMovieIds = marvelItems.movies.map((el) => el.id)
    const marvelSeriesIds = marvelItems.series.map((el) => el.id)

    movieStd = movieCredits.reduce((acc, cur) => {
        if (!marvelMovieIds.includes(cur.id)) {
            return [...acc, cur]
        }
        return acc
    }, [])
    movieMrvl = movieCredits.length - movieStd.length

    tvStd = tvCredits.reduce((acc, cur) => {
        if (!marvelSeriesIds.includes(cur.id)) {
            return [...acc, cur]
        }
        return acc
    }, [])
    tvMrvl = tvCredits.length - tvStd.length

    return {
        movieStd: movieStd.length,
        movieMrvl: movieMrvl,
        tvStd: tvStd.length,
        tvMrvl: tvMrvl,
    }
}

function getRevenueData(actors) {
    let actor1Revenue = data.extractActorFilmRevenue(
        actors.actor1.name,
        actors.actor1.movie_credits.cast
    )
    let actor2Revenue = data.extractActorFilmRevenue(
        actors.actor2.name,
        actors.actor2.movie_credits.cast
    )

    let rawActorsRevenue = actor1Revenue.concat(actor2Revenue)

    // const costarringCombinedRevenue =
    //     data.combineCostarringRevenue(rawActorsRevenue)

    const yearlyCombinedRevenue = rawActorsRevenue.reduce((acc, curr) => {
        const {actor, date, revenue, titles} = curr
        const findObj = acc.find(
            (o) => o.actor === actor && o.date.getTime() === date.getTime()
        )
        if (!findObj) {
            acc.push(curr)
        } else {
            findObj.revenue += revenue
            for (let title of titles) {
                if (!findObj.titles.includes(title)) {
                    findObj.titles.push(title)
                }
            }
        }
        return acc
    }, [])

    const finishedRevenue = data.assignDefaultValues(yearlyCombinedRevenue, [
        'Robert Downey Jr.',
        'Benedict Cumberbatch',
        // 'Both',
    ])

    return finishedRevenue
}

function extractActorFilmRevenue(actor, credits) {
    return credits
        .map((val) => {
            if (val.release_date && val.revenue) {
                return {
                    date: new Date(
                        parseInt(val.release_date.substring(0, 4)),
                        0,
                        1
                    ),
                    revenue: val.revenue,
                    actor: actor,
                    id: val.id,
                    titles: [val.title],
                }
            }
        })
        .filter((el) => el !== undefined)
}

// function combineCostarringRevenue(revenue, combined = []) {
//     if (revenue.length > 0) {
//         const current = revenue.shift()
//         const otherActor = revenue.find((o) => o.id === current.id)
//         if (otherActor) {
//             revenue.splice(revenue.indexOf(otherActor), 1)
//             combined.push({
//                 date: current.date,
//                 revenue: current.revenue,
//                 actor: 'Both',
//                 id: current.id,
//                 titles: current.titles
//             })
//         } else {
//             combined.push(current)
//         }
//         return data.combineCostarringRevenue(revenue, combined)
//     } else {
//         return combined
//     }
// }

// Source:
// https://stackoverflow.com/questions/14713503/how-to-handle-layers-with-missing-data-points-in-d3-layout-stack
function assignDefaultValues(dataset, keys) {
    var defaultRevenue = 0
    var defaultId = null
    var hadData = [true, true, true]
    var newData = []
    var previousdate = new Date()
    var sortByDate = function (a, b) {
        return a.date > b.date ? 1 : -1
    }

    dataset.sort(sortByDate)
    dataset.forEach(function (row) {
        if (row.date.valueOf() !== previousdate.valueOf()) {
            for (var i = 0; i < keys.length; ++i) {
                if (hadData[i] === false) {
                    newData.push({
                        date: previousdate,
                        revenue: defaultRevenue,
                        actor: keys[i],
                        id: defaultId,
                    })
                }
                hadData[i] = false
            }
            previousdate = row.date
        }
        hadData[keys.indexOf(row.actor)] = true
    })
    for (var i = 0; i < keys.length; ++i) {
        if (hadData[i] === false) {
            newData.push({
                date: previousdate,
                revenue: defaultRevenue,
                actor: keys[i],
                id: defaultId,
            })
        }
    }
    return dataset.concat(newData).sort(sortByDate)
}

export const data = {
    getPopularRolesData,
    compareActorPopularity,
    compareCharacterName,
    getCreditTypeData,
    getCreditCountData,
    separateMarvelCredits,
    getRevenueData,
    extractActorFilmRevenue,
    // combineCostarringRevenue,
    assignDefaultValues,
}
