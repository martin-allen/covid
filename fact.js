// FACTS

d3.csv('./data/output/ml_summary.csv')
    .then(data => {

        const parse = d3.timeParse('%Y-%m-%d');
        const row = data[0];
        const dt = {
            date: parse(row.date),
            new: row.new,
            total: row.total,
            deaths: row.deaths,
            active: row.active
        }
        facts(dt);
    })

function facts(data) {

    // date
    const dayParse = d3.timeFormat('%A')
    const dateParse = d3.timeFormat('%b. %d')
    const dayText = d3.select('#fact-date tspan')
    const dateText = d3.select('#fact-date p')
    dayText.text(`${dayParse(data.date)},`);
    dateText.text(dateParse(data.date));

    // stats
    const nw = d3.select('#fact-new p')
    const total = d3.select('#fact-total p')
    const active = d3.select('#fact-active p')
    const deaths = d3.select('#fact-deaths p')

    nw.text(data.new);
    total.text(data.total);
    active.text(data.active);
    deaths.text(data.deaths);

}

// LINE

d3.csv('./data/output/ml_general.csv')
    .then((data) => {

        let series = [];
        let dates = [];
        const parse = d3.timeParse('%Y-%m-%d');

        for (i = 0; i < 31; i++) {
            series.push(+data[i].new);
            let date = parse(data[i].date);
            dates.push(date);
        }

        const dt = {
            dates: dates,
            series: series
        }

        drawFact({
            series: series.reverse(),
            dates: dates.reverse()
        });

    })

function drawFact(data) {

    

    const width = 200;
    const height = 150;
    const margin = {top: 20, right: 16, bottom: 30, left: 15};

    const svg = d3.select('#fact-line')
        .append('svg')
            .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.series)])
        .range([height - margin.bottom, margin.top]);

    const l = d3.line()
        // .curve(d3.curveStep)
        .x((d,i) => x(data.dates[i]))
        .y(d => y(d)); 

    const xx = g =>
        g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(0))
            .call(g => g.select('.domain')
                .attr('stroke-width', 0.7));
    // line dots
    svg
        .append('defs')
        .append('marker')
        .attr('id', 'fact-dot')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .append('circle')
            .attr('cx', 10)
            .attr('cy', 10)
            .attr('r', 2)
            .style('fill', '#22456B');

    svg.append('g')
        .call(xx);
    
    const line = svg.append('path')
        .datum(data.series)
            .attr('fill', 'none')
            .attr('stroke', '#22456B')
            .attr('stroke-width', 2.5)
            .attr('d', l)
            .attr('marker-start', 'url(#fact-dot)')
            .attr('marker-end', 'url(#fact-dot)')
    svg.append('text')
        .attr('transform', `translate(${67}, ${height - 15})`)
        .attr('font-size', 9)
        .attr('class', 'num')
        .text('Last 30 Days')

}