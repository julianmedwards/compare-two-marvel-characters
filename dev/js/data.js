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

function getRevenueData() {
    const revenue = []
    return revenue
}

export const data = {
    getPopularRolesData,
    compareActorPopularity,
    compareCharacterName,
    getCreditTypeData,
    getCreditCountData,
    separateMarvelCredits,
    getRevenueData,
}
