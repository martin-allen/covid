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
    const margin = {top: 100, right: 10, bottom: 70, left: 10};
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
    others.transition().attr('opacity', 0.65);
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