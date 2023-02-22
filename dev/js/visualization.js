'use strict'

import * as d3 from 'd3'

import {data} from './data.js'

// Widgets

// 1: Compare most popular rolls, horizontal bar chart.
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
        title: (d) => d.title,
        srcs: srcs,
        yDomain: d3.groupSort(
            rolesData,
            ([d]) => -d.popularity,
            (d) => d.character
        ), // sort by descending frequency
        xLabel: 'Popularity Score →',
        width: 800,
        colorSet: ['#518cca', '#f78f3f'],
    })
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
        marginTop = 30 + 40, // the top margin, in pixels
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
        titleColor = 'black', // title fill color when atop bar
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

    // Compute the default height.
    if (height === undefined)
        height =
            Math.ceil((yDomain.size + yPadding) * 25) + marginTop + marginBottom
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
        .attr('text-anchor', 'start')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('font-weight', '600')
        .selectAll('text')
        .data(I)
        .join('text')
        .attr('x', xScale(0))
        .attr('y', (i) => yScale(Y[i]) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('dx', 5)
        .text(title)
        .call((text) =>
            text
                .filter((i) => xScale(X[i]) - xScale(0) < 20) // short bars
                .attr('dx', +4)
                .attr('fill', titleAltColor)
                .attr('text-anchor', 'start')
        )

    svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(yAxis)

    var lgndSize = 16
    const legend = svg.append('g').attr('transform', `translate(-60,-90)`)

    // Create color legend
    const dots = legend
        .selectAll('dots')
        .data(srcs.ids)
        .enter()
        .append('rect')
        .attr('x', 100)
        .attr('y', function (d, i) {
            return 100 + i * (lgndSize + 6)
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
            return 100 + i * (lgndSize + 6) + lgndSize / 2
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style('fill', function (d) {
            return 'black'
        })
        .text(function (d) {
            return d
        })
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')
        .attr('font-size', lgndSize)

    return svg.node()
}

// 2: Compare type of credits: movie vs tv vs prod., pie chart.
function buildCreditTypeWidget(actors) {
    const actor1Data = data.getCreditTypeData(actors.actor1)
    const actor2Data = data.getCreditTypeData(actors.actor2)

    const actor1Chart = vis.PieChart(actor1Data, {
        header: actors.actor1.name,
        type: (actor1Data) => actor1Data.type,
        value: (actor1Data) => actor1Data.value,
        width: 300,
        height: 300,
    })
    const actor2Chart = vis.PieChart(actor2Data, {
        header: actors.actor2.name,
        type: (actor2Data) => actor2Data.type,
        value: (actor2Data) => actor2Data.value,
        width: 300,
        height: 300,
    })
    return [actor1Chart, actor2Chart]
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/pie-chart
// Modified by Julian Edwards
function PieChart(
    data,
    {
        header, // Header/name of pie chart
        type = ([x]) => x, // given d in data, returns the (ordinal) label
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
    const N = d3.map(data, type)
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
        .attr('viewBox', [-width / 2, -height / 2, width, height + 20])
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
        .attr('y', (_, i) => `${i * 1.2}em`)
        .attr('font-weight', (_, i) => (i ? null : 'bold'))
        .text((d) => d)

    if (header)
        svg.append('text')
            .text(header)
            .style('text-anchor', 'middle')
            .attr('y', outerRadius + 18)

    return Object.assign(svg.node(), {scales: {color}})
}

// 3: Compare # of cast credits, movie vs tv vs marvel,
// grouped vertical bar chart
// ***Marvel movie credits need to stack, not be separate.
function buildCreditCountWidget(actors) {
    const creditCountData = data.getCreditCountData(
        actors.actor1,
        actors.actor2,
        actors.marvelItems
    )

    const movieTypes = ['Movie Roles', 'Marvel Movies']
    const seriesTypes = ['TV Roles', 'Marvel Series']

    const movieChart = vis.StackedBarChart(creditCountData.movies, {
        x: (d) => d.actor,
        y: (d) => d.count,
        z: (d) => d.type,
        xDomain: d3.groupSort(
            creditCountData.movies,
            (D) => d3.sum(D, (d) => -d.count),
            (d) => d.actor
        ),
        yLabel: '↑ Credits',
        zDomain: movieTypes,
        xPadding: 0.4,
        colors: ['#d7191c', '#FFF333'],
        width: 250,
        height: 500,
    })

    const seriesChart = vis.StackedBarChart(creditCountData.series, {
        x: (d) => d.actor,
        y: (d) => d.count,
        z: (d) => d.type,
        xDomain: d3.groupSort(
            creditCountData.series,
            (D) => d3.sum(D, (d) => -d.count),
            (d) => d.actor
        ),
        zDomain: seriesTypes,
        xPadding: 0.4,
        colors: ['#fdae61', '#AAFD61'],
        width: 250,
        height: 500,
    })

    return {movies: movieChart, series: seriesChart}
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/stacked-bar-chart
// Modified by Julian Edwards.
function StackedBarChart(
    data,
    {
        x = (d, i) => i, // given d in data, returns the (ordinal) x-value
        y = (d) => d, // given d in data, returns the (quantitative) y-value
        z = () => 1, // given d in data, returns the (categorical) z-value
        title, // given d in data, returns the title text
        marginTop = 80, // top margin, in pixels
        marginRight = 25, // right margin, in pixels
        marginBottom = 30, // bottom margin, in pixels
        marginLeft = 40, // left margin, in pixels
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        xDomain, // array of x-values
        xRange = [marginLeft, width - marginRight], // [left, right]
        xPadding = 0.1, // amount of x-range to reserve to separate bars
        yType = d3.scaleLinear, // type of y-scale
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        zDomain, // array of z-values
        offset = d3.stackOffsetDiverging, // stack offset method
        order = d3.stackOrderNone, // stack order method
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        colors = d3.schemeTableau10, // array of colors
    } = {}
) {
    // Compute values.
    const X = d3.map(data, x)
    const Y = d3.map(data, y)
    const Z = d3.map(data, z)

    // Compute default x- and z-domains, and unique them.
    if (xDomain === undefined) xDomain = X
    if (zDomain === undefined) zDomain = Z
    xDomain = new d3.InternSet(xDomain)
    zDomain = new d3.InternSet(zDomain)

    // Omit any data not present in the x- and z-domains.
    const I = d3
        .range(X.length)
        .filter((i) => xDomain.has(X[i]) && zDomain.has(Z[i]))

    // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
    // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
    // each tuple has an i (index) property so that we can refer back to the
    // original data point (data[i]). This code assumes that there is only one
    // data point for a given unique x- and z-value.
    const series = d3
        .stack()
        .keys(zDomain)
        .value(([x, I], z) => Y[I.get(z)])
        .order(order)
        .offset(offset)(
            d3.rollup(
                I,
                ([i]) => i,
                (i) => X[i],
                (i) => Z[i]
            )
        )
        .map((s) => s.map((d) => Object.assign(d, {i: d.data[1].get(s.key)})))

    // Compute the default y-domain. Note: diverging stacks can be negative.
    if (yDomain === undefined) yDomain = d3.extent(series.flat(2))

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding)
    const yScale = yType(yDomain, yRange)
    const color = d3.scaleOrdinal(zDomain, colors)
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat)

    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat)
        title = (i) => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`
    } else {
        const O = d3.map(data, (d) => d)
        const T = title
        title = (i) => T(O[i], i, data)
    }

    const svg = d3
        .create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

    svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(yAxis)
        .call((g) => g.select('.domain').remove())
        .call((g) =>
            g
                .selectAll('.tick line')
                .clone()
                .attr('x2', width - marginLeft - marginRight)
                .attr('stroke-opacity', 0.1)
        )
        .call((g) =>
            g
                .append('text')
                .attr('x', -marginLeft)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(yLabel)
        )

    const bar = svg
        .append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        .attr('fill', ([{i}]) => color(Z[i]))
        .selectAll('rect')
        .data((d) => d)
        .join('rect')
        .attr('x', ({i}) => xScale(X[i]))
        .attr('y', ([y1, y2]) => Math.min(yScale(y1), yScale(y2)))
        .attr('height', ([y1, y2]) => Math.abs(yScale(y1) - yScale(y2)))
        .attr('width', xScale.bandwidth())

    if (title) bar.append('title').text(({i}) => title(i))

    var lgndSize = 14
    const legend = svg.append('g').attr('transform', `translate(-60,-80)`)

    // Create color legend
    const dots = legend
        .selectAll('dots')
        .data(zDomain)
        .enter()
        .append('rect')
        .attr('x', 100)
        .attr('y', function (d, i) {
            return 100 + i * (lgndSize + 6)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr('width', lgndSize)
        .attr('height', lgndSize)
        .style('fill', function (d) {
            return color(d)
        })

    // Add one dot in the legend for each name.
    legend
        .selectAll('labels')
        .data(zDomain)
        .enter()
        .append('text')
        .attr('x', 100 + lgndSize * 1.2)
        .attr('y', function (d, i) {
            return 100 + i * (lgndSize + 6) + lgndSize / 2
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style('fill', function (d) {
            return 'black'
        })
        .text(function (d) {
            return d
        })
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle')
        .attr('font-size', lgndSize)

    svg.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(xAxis)

    return Object.assign(svg.node(), {scales: {color}})
}

// 4: Revenue of movies by year, stacked area/bar chart
// TV vs Movie?
function buildRevenueWidget(actors) {
    const revenueData = data.getRevenueData(actors)

    console.dir(revenueData)

    return vis.LineChart(revenueData, {
        x: (d) => d.date,
        y: (d) => d.revenue,
        z: (d) => d.actor,
        title: (d) => d.titles,
        yLabel: '↑ Film Revenue',
        width: 1200,
        height: 500,
        yFormat: d3.format('~s'),
    })
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-chart
// Modified by Julian Edwards.
function LineChart(
    data,
    {
        x = ([x]) => x, // given d in data, returns the (temporal) x-value
        y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
        z = () => 1, // given d in data, returns the (categorical) z-value
        title, // given d in data, returns the title text
        defined, // for gaps in data
        curve = d3.curveLinear, // method of interpolation between points
        marginTop = 20, // top margin, in pixels
        marginRight = 30, // right margin, in pixels
        marginBottom = 30, // bottom margin, in pixels
        marginLeft = 40, // left margin, in pixels
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        xType = d3.scaleUtc, // type of x-scale
        xDomain, // [xmin, xmax]
        xRange = [marginLeft, width - marginRight], // [left, right]
        yType = d3.scaleLinear, // type of y-scale
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        zDomain, // array of z-values
        strokeLinecap, // stroke line cap of line
        strokeLinejoin, // stroke line join of line
        strokeWidth = 1.5, // stroke width of line
        strokeOpacity, // stroke opacity of line
        mixBlendMode = 'multiply', // blend mode of lines
        voronoi, // show a Voronoi overlay? (for debugging)
        colors = d3.schemeTableau10, // array of colors for z
    } = {}
) {
    // Compute values.
    const X = d3.map(data, x)
    const Y = d3.map(data, y)
    const Z = d3.map(data, z)
    const O = d3.map(data, (d) => d)
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i])
    const D = d3.map(data, defined)

    // Compute default domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X)
    if (yDomain === undefined)
        yDomain = [0, d3.max(Y, (d) => (typeof d === 'string' ? +d : d))]
    if (zDomain === undefined) zDomain = Z
    zDomain = new d3.InternSet(zDomain)

    // Omit any data not present in the z-domain.
    const I = d3.range(X.length).filter((i) => zDomain.has(Z[i]))

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange)
    const yScale = yType(yDomain, yRange)
    const color = d3.scaleOrdinal(zDomain, colors)
    const xAxis = d3
        .axisBottom(xScale)
        .ticks(width / 80)
        .tickSizeOuter(0)
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat)

    // Compute titles.
    const T =
        title === undefined ? Z : title === null ? null : d3.map(data, title)

    // Construct a line generator.
    const line = d3
        .line()
        .defined((i) => D[i])
        .curve(curve)
        .x((i) => xScale(X[i]))
        .y((i) => yScale(Y[i]))

    const svg = d3
        .create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
        .style('-webkit-tap-highlight-color', 'transparent')
        .on('pointerenter', pointerentered)
        .on('pointermove', pointermoved)
        .on('pointerleave', pointerleft)
        .on('touchstart', (event) => event.preventDefault())

    // An optional Voronoi display (for fun).
    if (voronoi)
        svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr(
                'd',
                d3.Delaunay.from(
                    I,
                    (i) => xScale(X[i]),
                    (i) => yScale(Y[i])
                )
                    .voronoi([0, 0, width, height])
                    .render()
            )

    svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(xAxis)

    svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(yAxis)
        .call((g) => g.select('.domain').remove())
        .call(
            voronoi
                ? () => {}
                : (g) =>
                      g
                          .selectAll('.tick line')
                          .clone()
                          .attr('x2', width - marginLeft - marginRight)
                          .attr('stroke-opacity', 0.1)
        )
        .call((g) =>
            g
                .append('text')
                .attr('x', -marginLeft)
                .attr('y', 10)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'start')
                .text(yLabel)
        )

    const path = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', typeof color === 'string' ? color : null)
        .attr('stroke-linecap', strokeLinecap)
        .attr('stroke-linejoin', strokeLinejoin)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-opacity', strokeOpacity)
        .selectAll('path')
        .data(d3.group(I, (i) => Z[i]))
        .join('path')
        .style('mix-blend-mode', mixBlendMode)
        .attr('stroke', typeof color === 'function' ? ([z]) => color(z) : null)
        .attr('d', ([, I]) => line(I))

    const dot = svg.append('g').attr('display', 'none')

    dot.append('circle').attr('r', 2.5)

    dot.append('text')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .attr('y', -8)

    function pointermoved(event) {
        const [xm, ym] = d3.pointer(event)
        const i = d3.least(I, (i) =>
            Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)
        ) // closest point
        path.style('stroke', ([z]) => (Z[i] === z ? null : '#ddd'))
            .filter(([z]) => Z[i] === z)
            .raise()
        dot.attr('transform', `translate(${xScale(X[i])},${yScale(Y[i])})`)
        if (T) {
            let titlesText = T[i]
            if (Array.isArray(titlesText)) {
                titlesText = titlesText.join('; ')
            }
            dot.select('text').text(titlesText)
        }
        let chartRect = svg.select('g').node().getBBox()
        let titleRect = dot.select('text').node().getBBox()
        if (
            xScale(X[i]) + titleRect.width / 2 >
            chartRect.x + chartRect.width
        ) {
            dot.select('text').attr(
                'x',
                (xScale(X[i]) +
                    titleRect.width / 2 -
                    (chartRect.x + chartRect.width)) *
                    -1
            )
        } else {
            dot.select('text').attr('x', '')
        }

        svg.property('value', O[i]).dispatch('input', {bubbles: true})
    }

    function pointerentered() {
        path.style('mix-blend-mode', null).style('stroke', '#ddd')
        dot.attr('display', null)
    }

    function pointerleft() {
        path.style('mix-blend-mode', mixBlendMode).style('stroke', null)
        dot.attr('display', 'none')
        svg.node().value = null
        svg.dispatch('input', {bubbles: true})
    }

    return Object.assign(svg.node(), {value: null})
}

export const vis = {
    buildRolePopWidget,
    buildCreditTypeWidget,
    buildCreditCountWidget,
    buildRevenueWidget,
    PieChart,
    BarChart,
    StackedBarChart,
    LineChart,
}

export const d = {
    d3,
}
