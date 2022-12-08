'use strict'

import * as d3 from 'd3'
import {data} from './data.js'

// Information
// Name
// Picture
// Birthday/Place

// Widgets

// 1: Role popularity,
// Horizontal bar chart
// Compare actor's most popular role's popularity

function buildRolePopWidget(actors) {
    const actor1Roles = data.getPopularRolesData(actors.actor1)
    const actor2Roles = data.getPopularRolesData(actors.actor2)

    const rolesData = actor1Roles.concat(actor2Roles)
    const srcs = {
        names: [actors.actor1.name, actors.actor2.name],
        ids: [actors.actor1.id, actors.actor2.id],
    }

    return vis.BarChart(rolesData, {
        x: (d) => d.popularity,
        y: (d) => d.character,
        srcs: srcs,
        yDomain: d3.groupSort(
            rolesData,
            ([d]) => -d.popularity,
            (d) => d.character
        ), // sort by descending frequency
        xLabel: 'Popularity Score →',
        width: 600,
        colorSet: ['#518cca', '#f78f3f'],
    })
}

// 2: Credit Types
// Pie chart
// Compare type of credits: movie vs tv, cast vs crew, etc.

function buildCreditTypeWidget(actors) {
    const actor1Data = data.getCreditTypeData(actors.actor1)
    const actor2Data = data.getCreditTypeData(actors.actor2)

    const actor1Chart = vis.PieChart(actor1Data, {
        name: (actor1Data) => actor1Data.name,
        value: (actor1Data) => actor1Data.value,
        width: 300,
        height: 300,
    })
    const actor2Chart = vis.PieChart(actor2Data, {
        name: (actor2Data) => actor2Data.name,
        value: (actor2Data) => actor2Data.value,
        width: 300,
        height: 300,
    })
    return [actor1Chart, actor2Chart]
}

// 3: Credits,
// Number of movies/tv shows they've been in
// Number of marvel movies/shows they've been in
// Grouped vertical bar chart

function buildCreditsWidget(actors) {}

// 4: Revenue of movies by year, stacked area/bar chart
// TV vs Movie?

function buildRevenueWidget(actors) {
    const revenue = data.getRevenueData(actors)
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/horizontal-bar-chart
// Modified by Julian Edwards
function BarChart(
    data,
    {
        x = (d) => d, // given d in data, returns the (quantitative) x-value
        y = (d, i) => i, // given d in data, returns the (ordinal) y-value
        srcs = [], // Sources/categories of datasets
        title, // given d in data, returns the title text
        marginTop = 30, // the top margin, in pixels
        marginRight = 0, // the right margin, in pixels
        marginBottom = 60, // the bottom margin, in pixels
        marginLeft = 200, // the left margin, in pixels
        width = 640, // the outer width of the chart, in pixels
        height, // outer height, in pixels
        xType = d3.scaleLinear, // type of x-scale
        xDomain, // [xmin, xmax]
        xRange = [marginLeft, width - marginRight], // [left, right]
        xFormat, // a format specifier string for the x-axis
        xLabel, // a label for the x-axis
        yPadding = 0.1, // amount of y-range to reserve to separate bars
        yDomain, // an array of (ordinal) y-values
        yRange, // [top, bottom]
        colorSet, // A color scheme set for bar filling
        titleColor = 'white', // title fill color when atop bar
        titleAltColor = 'currentColor', // title fill color when atop background
    } = {}
) {
    // Compute values.
    const X = d3.map(data, x)
    const Y = d3.map(data, y)

    // Compute default domains, and unique the y-domain.
    if (xDomain === undefined) xDomain = [0, d3.max(X)]
    if (yDomain === undefined) yDomain = Y
    yDomain = new d3.InternSet(yDomain)

    // Omit any data not present in the y-domain.
    const I = d3.range(X.length).filter((i) => yDomain.has(Y[i]))

    const legendHeight = 50

    // Compute the default height.
    if (height === undefined)
        height =
            Math.ceil((yDomain.size + yPadding) * 25) +
            marginTop +
            marginBottom +
            legendHeight
    if (yRange === undefined) yRange = [marginTop, height - marginBottom]

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange)
    const yScale = d3.scaleBand(yDomain, yRange).padding(yPadding)
    const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat)
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0)

    // Compute titles.
    if (title === undefined) {
        const formatValue = xScale.tickFormat(100, xFormat)
        title = (i) => `${formatValue(X[i])}`
    } else {
        const O = d3.map(data, (d) => d)
        const T = title
        title = (i) => T(O[i], i, data)
    }

    // Set colors
    const color = d3.scaleOrdinal().domain(srcs.ids).range(colorSet)

    const svg = d3
        .create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

    svg.append('g')
        .attr('transform', `translate(0,${marginTop})`)
        .call(xAxis)
        .call((g) => g.select('.domain').remove())
        .call((g) =>
            g
                .selectAll('.tick line')
                .clone()
                .attr('y2', height - marginTop - marginBottom)
                .attr('stroke-opacity', 0.1)
        )
        .call((g) =>
            g
                .append('text')
                .attr('x', width - marginRight)
                .attr('y', -22)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'end')
                .text(xLabel)
        )

    svg.append('g')
        .selectAll('rect')
        .data(I)
        .join('rect')
        .attr('x', xScale(0))
        .attr('y', (i) => yScale(Y[i]))
        .attr('width', (i) => xScale(X[i]) - xScale(0))
        .attr('height', yScale.bandwidth())
        .attr('fill', function (d) {
            return color(data[d].actor)
        })

    svg.append('g')
        .attr('fill', titleColor)
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('text')
        .data(I)
        .join('text')
        .attr('x', (i) => xScale(X[i]))
        .attr('y', (i) => yScale(Y[i]) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('dx', -4)
        .text(title)
        .call((text) =>
            text
                .filter((i) => xScale(X[i]) - xScale(0) < 20) // short bars
                .attr('dx', +4)
                .attr('fill', titleAltColor)
                .attr('text-anchor', 'start')
        )

    svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(yAxis)

    var lgndSize = 20
    const legend = svg.append('g').attr('transform', `translate(-60,250)`)

    // Create color legend
    const dots = legend
        .selectAll('dots')
        .data(srcs.ids)
        .enter()
        .append('rect')
        .attr('x', 100)
        .attr('y', function (d, i) {
            return 100 + i * (lgndSize + 5)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr('width', lgndSize)
        .attr('height', lgndSize)
        .style('fill', function (d) {
            return color(d)
        })

    // Add one dot in the legend for each name.
    legend
        .selectAll('labels')
        .data(srcs.names)
        .enter()
        .append('text')
        .attr('x', 100 + lgndSize * 1.2)
        .attr('y', function (d, i) {
            return 100 + i * (lgndSize + 5) + lgndSize / 2
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style('fill', function (d) {
            return 'black'
        })
        .text(function (d) {
            return d
        })
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')

    return svg.node()
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/pie-chart
function PieChart(
    data,
    {
        name = ([x]) => x, // given d in data, returns the (ordinal) label
        value = ([, y]) => y, // given d in data, returns the (quantitative) value
        title, // given d in data, returns the title text
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
        outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
        labelRadius = innerRadius * 0.2 + outerRadius * 0.8, // center radius of labels
        format = ',', // a format specifier for values (in the label)
        names, // array of names (the domain of the color scale)
        colors, // array of colors for names
        stroke = innerRadius > 0 ? 'none' : 'white', // stroke separating widths
        strokeWidth = 1, // width of stroke separating wedges
        strokeLinejoin = 'round', // line join of stroke separating wedges
        padAngle = stroke === 'none' ? 1 / outerRadius : 0, // angular separation between wedges
    } = {}
) {
    // Compute values.
    const N = d3.map(data, name)
    const V = d3.map(data, value)
    const I = d3.range(N.length).filter((i) => !isNaN(V[i]))

    // Unique the names.
    if (names === undefined) names = N
    names = new d3.InternSet(names)

    // Chose a default color scheme based on cardinality.
    if (colors === undefined) colors = d3.schemeSpectral[names.size]
    if (colors === undefined)
        colors = d3.quantize(
            (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
            names.size
        )

    // Construct scales.
    const color = d3.scaleOrdinal(names, colors)

    // Compute titles.
    if (title === undefined) {
        const formatValue = d3.format(format)
        title = (i) => `${N[i]}\n${formatValue(V[i])}`
    } else {
        const O = d3.map(data, (d) => d)
        const T = title
        title = (i) => T(O[i], i, data)
    }

    // Construct arcs.
    const arcs = d3
        .pie()
        .padAngle(padAngle)
        .sort(null)
        .value((i) => V[i])(I)
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius)

    const svg = d3
        .create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

    svg.append('g')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-linejoin', strokeLinejoin)
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => color(N[d.data]))
        .attr('d', arc)
        .append('title')
        .text((d) => title(d.data))

    svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arcLabel.centroid(d)})`)
        .selectAll('tspan')
        .data((d) => {
            const lines = `${title(d.data)}`.split(/\n/)
            return d.endAngle - d.startAngle > 0.25 ? lines : lines.slice(0, 1)
        })
        .join('tspan')
        .attr('x', 0)
        .attr('y', (_, i) => `${i * 1.1}em`)
        .attr('font-weight', (_, i) => (i ? null : 'bold'))
        .text((d) => d)

    return Object.assign(svg.node(), {scales: {color}})
}

export const vis = {
    buildRolePopWidget,
    buildCreditTypeWidget,
    buildCreditsWidget,
    buildRevenueWidget,
    PieChart,
    BarChart,
}

export const d = {
    d3,
}

// function updatePieChart(data) {
//     // Compute the position of each group on the pie:
//     const pie = d3
//         .pie()
//         .value(function (d) {
//             return d[1]
//         })
//         .sort(function (a, b) {
//             return d3.ascending(a.key, b.key)
//         }) // This make sure that group order remains the same in the pie chart
//     const data_ready = pie(Object.entries(data))

//     // map to data
//     const u = svg.selectAll('path').data(data_ready)

//     // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
//     u.join('path')
//         .transition()
//         .duration(1000)
//         .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
//         .attr('fill', function (d) {
//             return color(d.data[0])
//         })
//         .attr('stroke', 'white')
//         .style('stroke-width', '2px')
//         .style('opacity', 1)
// }
