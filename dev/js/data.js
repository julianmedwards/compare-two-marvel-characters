'use strict'

function getCreditTypeData(actor) {
    const credits = [
        {name: 'Movies', value: actor.movie_credits.cast.length},
        {name: 'TV', value: actor.tv_credits.cast.length},
        {name: 'Movie Crew', value: actor.movie_credits.crew.length},
        {name: 'TV Crew', value: actor.tv_credits.crew.length},
    ]
    credits.columns = ['name', 'values']
    return credits
}

function getRevenueData() {
    const revenue = []
    return revenue
}

export const data = {
    getCreditTypeData,
    getRevenueData,
}
