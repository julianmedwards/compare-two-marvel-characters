'use strict'

function getPopularRolesData(actor) {
    let roles = actor.movie_credits.cast
    roles.sort(data.compareActorPopularity)

    roles = roles.reduce(function (p, c) {
        if (
            !p.some(function (el) {
                return compareCharacterName(el.character, c.character)
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

function getRevenueData() {
    const revenue = []
    return revenue
}

export const data = {
    getPopularRolesData,
    compareActorPopularity,
    getCreditTypeData,
    getRevenueData,
}
