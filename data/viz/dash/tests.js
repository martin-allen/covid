//
// PIANO
//

d3.csv('../../output/ml_test.csv')
    .then((data) => {
        let ml = [];
        let ont = [];
        let dates = [];

        for (i = data.length - 7; i > 0; i--) {
            let row = data[i];
            ml.push(+row.ML); 
            ont.push(+row.Ont);
            dates.push(row.date);       
        }

        const dateParse = d3.timeParse('%b %d');
        dates = dates.map(s => dateParse(s));

        const dt = {
            ml: ml,
            ont: ont,
            dates: dates
        }

        drawPositive(dt);
        legend();

    })

function drawPositive(data) {

    const width = 1000;
    const height = 600;
    const margin = {top: 100, right: 10, bottom: 50, left: 10};
    const barHeight = 170;

    // SCALES
    // only need y scale for labeling
    const x = d3.scaleBand()
        .domain(d3.range(data.dates.length))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    // log scale used to map range of data to a [0,1] color scale
    const ls = d3.scaleLog()
        .domain([0.01, 10])
        .range([0.2, 0.9]);
    const c = d3.scaleSequential(d3.interpolateBlues);

    // AXES:
    // - date axis above London
    // - val axis below/above Ldn/Ont
    
    // getting month indicides from date axis
    let inds = [0];
    for (i = 0; i < data.dates.length - 1; i++) {
        m = data.dates[i].getMonth();
        p = data.dates[i-1];
        if (p != null) { 
            p = p.getMonth()
            if (m != p) {
                inds.push(i);
            }
        }
    }

    // Date
    const dateFormat = d3.timeFormat('%b')
    const xd = g => 
        g
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(x)
                    .tickFormat((d,i) => {
                        if (inds.includes(i) == true) {
                            return dateFormat(data.dates[i]);
                        }
                    }))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line')
                        .attr('stroke', 'black')
                        .attr('stroke-width', function(d,i) {
                            if (inds.includes(i) == true) {
                                return 3;
                            }
                            else { return 2; }
                        })
                        .attr('y2', function(d,i) {
                            if (inds.includes(i) == false) {
                                return '-10';
                            }
                            else { return '-6'; }
                        }))
            .call(g => g.selectAll('.tick text')
                        .attr('y', -13)
                        .attr('fill', 'black')
                        .attr('font-size', '22px'));
    
    // London
    const xl = g => 
        g
            .attr("transform", `translate(0,
                                ${margin.top + barHeight})`)
            .attr('id', 'piano-axis-london')
            .attr('visibility', 'hidden')
            .call(d3.axisBottom(x)
                    .tickFormat((d,i) => {
                        return (data.ml[i]) + '%'; 
                    }))
            .call(g => g.selectAll('.domain').remove())
            .call(g => g.selectAll('.tick text')
                    .attr('font-size', '20px'))
            .call(g => g.selectAll('.tick line'));
    
    // Ontario
    const xo = g =>
        g
            .attr("transform", `translate(0,
                ${margin.top + barHeight + margin.bottom})`)
            .attr('id', 'piano-axis-ont')
            .attr('visibility', 'hidden')
            .call(d3.axisTop(x)
                .tickFormat((d,i) => {
                    return (data.ont[i]) + '%';
                }))
            .call(g => g.selectAll('.domain').remove())
            .call(g => g.selectAll('.tick text')
                    .attr('font-size', '20px'))
            .call(g => g.selectAll('.tick line'));

    //
    // DRAWING
    //

    const chart = d3.select('#piano-chart');
    const svg = chart.append('svg')
        .attr('viewBox', [0, 0, width, height]);

    // hovering on whole svg
    svg.on('mouseleave', function() {
        svg.selectAll(':not(.legend-rect) rect')
            .attr('stroke', 'none')
            .transition()
            .attr('opacity', 1);
    })

    // LONDON
    const ldn = svg.append('g')
            .attr('id', 'piano-london')
            .attr('class', 'bars')
        // begins at just the top/left margin points
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .selectAll('rect')
        .data(data.ml)
        .join('rect')
                .attr('class', (d,i) => {
                    return `piano-rect bar_${i}`;
                })
            // unusual data join for both:
            // scales on x and color. Y is constant.
            .attr('x', (d, i) => x(i))
            .attr('y', 0)
            .attr('height', barHeight)
            .attr('width', x.bandwidth())
            .attr('fill', (d) => {
                // can't accept 0 for log scales
                if (d > 0) {
                    return c(ls(d));
                }
                else { return c(0.049) };
            })
            // hover trigger
            .on('mouseover', function() {
                let cls = d3.select(this).attr('class');
                cls = cls.slice(11,);
                barHover(cls);
            });

    // DRAWING ONT
    const ont = svg.append('g')
            .attr('id', 'piano-ontario')
            .attr('class', 'bars')
        // begins vertically after: top margin, span of London
        // chart, and bottom margin beneath that
        .attr('transform', `translate(${margin.left}, 
                            ${margin.top + barHeight + margin.bottom})`)
        .selectAll('rect')
        .data(data.ont)
        .join('rect')
                .attr('class', (d,i) => {
                    return `piano-rect bar_${i}`;
                })
            // unusual data join for both:
            // scales on x and color. Y is constant.
            .attr('x', (d, i) => x(i))
            .attr('y', 0)
            .attr('height', barHeight)
            .attr('width', x.bandwidth())
            .attr('fill', (d) => {
                // can't accept 0 for log scales
                if (d > 0) {
                    return c(ls(d));
                }
                else { return c(0.049) };
            })
            // hover trigger
            .on('mouseover', function() {
                let cls = d3.select(this)
                    .attr('class');
                cls = cls.slice(11,);
                barHover(cls);
            });

    svg.append('g')
        .call(xd);
    svg.append('g')
        .call(xl);
    svg.append('g')
        .call(xo);

    // labeling charts
    svg.append('text')
        .attr('transform', `translate(${width - 120}, ${50})`)
        .attr('font-size', '30px')
        .attr('font-weight', 'bold')
        .text('London');
    svg.append('text')
        .attr('transform', `translate(${width - 116},
                                 ${margin.top + (barHeight*2) 
                                    + margin.bottom + 50})`)
        .attr('font-size', '30px')
        .attr('font-weight', 'bold')
        .text('Ontario');
    
}

// drawing legend
function legend() {
    
    const svg = d3.select('#piano-chart svg');
    const legend = svg.append('g')
        .attr('id', 'piano-legend')
        // currently starting at origin point
        .attr('transform', `translate(0,0)`);
    
    // reconstructing scales for legend markers
    const logScale = d3.scaleLog()
        .domain([0.01, 0.15])
        .range([0.4, 0.9]);
    const colourScale = d3.scaleSequential(d3.interpolateBlues);

    // drawing rectangles
    legend
        .selectAll('rect')
        // abritrary percentage values chosen to show
        .data([0, 0.02, 0.04, 0.06, 0.08, 0.1])
        .enter()
        .append('rect')
            .attr('class', 'legend-rect')
            .attr('x', (d,i) => 40 * i)
            .attr('transform', (d,i) => `translate(${i*4}, -5)`)
            .attr('y', 30)
            .attr('width', 40)
            .attr('height', 30)
            .attr('fill', d => {
                if (d != 0) { 
                    return colourScale(logScale(d));
                }
                else { return colourScale(0.01) }                
            })
            .attr('stroke', 'grey')
            .attr('stroke-width', 1.5);
    // drawing rect labels
    legend
        .selectAll('text')
        .data(['0%', '2%', '4%', '6%', '8%', '10%'])
        .enter()
        .append('text')
            .attr('class', 'legend')
            .attr('transform', 'translate(35,-15)')
            .text(d => d)
            .style('font-size', '18px')
            .attr('x', (d,i) => 40 * i)
            .attr('y', 5)
            .attr('transform', (d,i) => {
                if (i != 5) {
                    return `translate(${(i * 4) + 6},10)`;
                }
                else { return `translate(${(i * 4) + 2},10)` }
            });
}

// triggers hover mechanic given the class of hovered bar
function barHover(cls) {

    // highlight hovered bar-pair
    const bars = d3.select(`#piano`)
        .select('#piano-chart')
        .selectAll(`.${cls}`);
    const others = d3.select(`#piano`)
        .select('#piano-chart')
        .selectAll(`rect:not(.${cls}):not(.legend-rect)`);
    others.attr('opacity', 0.65);
    others.attr('stroke', 'none');
    bars.attr('opacity', 1);
    bars.attr('stroke', 'grey');

    // showing axis for hovered bar-pair
    const xl = d3.selectAll('#piano-axis-london g');
    const xo = d3.selectAll('#piano-axis-ont g');
    const ind = +cls.slice(4,);
    xl.attr('visibility', 'hidden');
    xo.attr('visibility', 'hidden');
    d3.select(xl.nodes()[ind]).attr('visibility', 'visible');
    d3.select(xo.nodes()[ind]).attr('visibility', 'visible');

}

//
// TESTING BARS
//

d3.csv('../../output/ml_test.csv')
    .then((data) => {
        let tests = [];
        let rates = [];
        let dates = [];

        for (i = data.length - 7; i > 0; i--) {
            let row = data[i];
            tests.push(+row.ml_tests); 
            rates.push(+row.ML);
            dates.push(row.date);       
        }

        const dateParse = d3.timeParse('%b %d');
        dates = dates.map(s => dateParse(s));

        const dt = {
            dates: dates,
            tests: tests,
            rates: rates
        }
        
        drawTests(dt);
    })

function drawTests(data) {

    // same dimensions as daily
    const width = 1000;
    const height = 400;
    const margin = {top: 0, right: 0, bottom: 50, left: 50};

    // scales
    const x = d3.scaleBand()
        .domain(d3.range(data.dates.length))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.tests)])
        .range([height - margin.bottom, margin.top]);

    // scales for colour
    const ls = d3.scaleLog()
        .domain([0.1, 10])
        .range([0.35, 1]);
    const c = d3.interpolate(d3.schemeBlues[9][0], d3.schemeBlues[9][8]);

    const svg = d3.select('#piano')
        .select('#piano-chart')
            .append('svg')
                .attr('viewBox', [0, 0, width, height]);

    //
    // AXES
    //

    // getting month indicides from date axis
    let inds = [];
    for (i = 0; i < data.dates.length - 1; i++) {
        m = data.dates[i].getMonth();
        p = data.dates[i-1];
        if (p != null) { 
            p = p.getMonth()
            if (m != p) {
                inds.push(i);
            }
        }
    }

    const dateFormat = d3.timeFormat('%B')
    const xx = g =>
        g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .tickFormat((d,i) => {
                    if (inds.includes(i) == true) {
                        return dateFormat(data.dates[i]);
                    }
                }))
            .call(g => g.selectAll('.tick text')
                .style('font-size', '14px'));

    // y axis from daily
    const yx = g => 
        g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(2))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick text')
                .style('font-size', '14px'))
            .call(g => g.selectAll('.tick:not(:first-of-type) line')
                .attr('x2', width)
                .attr('stroke', '#dbdbdb')
                .attr('stroke-dasharray', '4 8')
                .attr('stroke-width', 0.7))
            .call(g => g.select('.tick:first-of-type').remove());

    //
    // LEGEND
    //

    // svg linearGradient
    // const defs = svg.append('defs');
    // const gradient = defs.append('linearGradient')
    //     .attr('id', 'testing-gradient');
    // gradient
    //     .attr('x1', '0%')
    //     .attr('x2', '100%')
    //     .attr('y1', '0%')
    //     .attr('y2', '0%');
    // gradient.append('stop')
    //     .attr('offset', '0%')
    //     .attr('stop-color', d3.schemeBlues[9][0]);
    // gradient.append('stop')
    //     .attr('offset', '100%')
    //     .attr('stop-color', d3.schemeBlues[9][8]);

    // legend = svg.append('g')
    //     .attr('id', 'testing-legend')
    //     .attr('transform', 'translate(0, 70)');
    // legend.append('rect')
    //     .attr('width', 200)
    //     .attr('height', 30)
    //     .attr('stroke', 'grey')
    //     .attr('fill', 'url(#testing-gradient)');
    // legend.append('text')
    //     .attr('dx', 205)
    //     .attr('dy', 21)
    //     .style('font-weight', 'bold')
    //     .text('% Positive')

    //
    // DRAWING
    //

    svg.append('g').call(xx);
    svg.append('g').call(yx);

    const bars = svg.append('g')
        .selectAll('rect')
        .data(data.tests)
        .join('rect')
            .attr('class', (d,i) => {
                return `piano-rect bar_${i}`;
            })
            .attr('x', (d,i) => x(i))
            .attr('y', d => y(d))
            .attr('height', d => y(0) - y(d))
            .attr('width', x.bandwidth())
            // OLD FILL: #617491
            .attr('fill', d3.schemeBlues[9][8]);
            // .attr('fill', (d,i) => {
            //     let r = data.rates[i];
            //     if (r > 0) {
            //         return c(ls(r));
            //     }
            //     else {
            //         return 'black';
            //     }
            //     // console.log(data.rates[i]);
            //     // console.log(c(ls(data.rates[i])));
            //     // return 'steelblue'
            // })
}