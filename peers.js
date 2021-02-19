//
// DATA COLLECTION
//

// peer chart data
let peerChartData = d3.csv('./data/output/ontario_new.csv')
    .then(data => {
        data = data.reverse().slice((data.length - 30),);
        // dates
        const dateParse = d3.timeParse('%Y-%m-%d');
        const dates = Array.from(d3.group(data, d => dateParse(d.date))
            .keys()).sort(d3.ascending);
        // series
        let nws = [];
        let avgs = [];
        const regions = [
            'London','Durham','Halton','Hamilton',
            'Ottawa','Waterloo','Windsor'
        ].reverse();
        regions.forEach(region => {
            let nw = [];
            let avg = [];
            data.forEach(row => {
                nw.push(+row[`${region}`]);
                avg.push(+row[`${region}_7`]);
            })
            nws[`${region}`] = nw
            avgs[`${region}`] = avg
        })

        return dt = {
            dates: dates,
            new: nws,
            avg: avgs
        }
    })

// peer fact data
let peerFactData = d3.csv('./data/output/ontario_summary.csv')
    .then(data => {
        let dt = {}
        data.forEach(e => {
            dt[`${e.unit}`] = [Math.round(+e.change), +e.cases, +e.deaths]
        })
        return dt;
    })

// gets data from csv promise and draws chart
async function peerMain() {

    const chartData = await peerChartData;
    const factData = await peerFactData;
    console.log(factData);
    
    //
    // INITIALIZING FACT
    //

    let dt = factData['London'];
    let change = dt[0];
    let cases = dt[1];
    let deaths = dt[2];

    // colour scale for change
    const g = d3.scaleSequential(d3.interpolateYlGn);
    const r = d3.scaleSequential(d3.interpolateYlOrRd);
    const lsg = d3.scaleLinear()
        .domain([0, -100])
        .range([0.35, 1]);
    const lsr = d3.scaleLinear()
        .domain([0, 100])
        .range([0.6, 1]);

    // getting elements
    const changeText = d3.select('#peer-change .fact-num');
    const casesText = d3.select('#peer-total .fact-num');
    const deathsText = d3.select('#peer-deaths .fact-num');

    // changing for London
    changeText.text(`${change}%`);
    changeText.style('color', () => {
        if (Math.sign(change) == -1) {
            return g(lsg(change));
        } else {
            return r(lsr(change));
        }
    })
    casesText.text(`${cases}`);
    deathsText.text(`${deaths}`);

    // 
    // INITIALIZING CHART
    //

    data = chartData;

    const width = 300;
    const height = 200;
    const margin = {top: 20, right: 30, bottom: 30, left: 15};
    const svg = d3.select('#peer-chart')
        .append('svg')
            .attr('viewBox', [0, 0, width, height]);

    // line dots
    svg
        .append('defs')
        .append('marker')
        .attr('id', 'peer-dot')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .append('circle')
            .attr('cx', 10)
            .attr('cy', 10)
            .attr('r', 3)
            .style('fill', '#22456B');
    // scales
    const x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.new['London'])])
        .range([height - margin.bottom, margin.top]);
    const l = d3.line()
        .x((d,i) => x(data.dates[i]))
        .y(d => y(d)); 
    // axis
    const xx = g =>
        g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .ticks(0))
            .call(g => g.select('.domain')
                .attr('stroke-width', 1))
                .attr('stroke', '#dbdbdb');

    const yx = g => 
            g
                .attr("transform", `translate(${width - margin.right},0)`)
                    .attr('id', 'peer-axis')
                .call(d3.axisRight(y))
                .call(g => g.selectAll('.tick line')
                    .each(function(d,i) {
                        if (i%2 != 0) {d3.select(this).remove()}
                    }))
                    .attr('stroke-width', 0.3)
                .call(g => g.selectAll('.tick text')
                    .each(function(d,i) {
                        if (i%2 != 0) {d3.select(this).remove()}
                    }))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick text')
                    .attr('class', 'num')
                    .style('font-size', '8px'))
                .call(g => g.select('.tick:first-of-type').remove());

    // DRAWING FIRST TIME
    svg.append('g')
        .call(xx);
    svg.append('g')
        .call(yx);
    const line = svg.append('path')
        .datum(data.new.London)
            .attr('fill', 'none')
            .attr('stroke', '#22456B')
            .attr('stroke-width', 2.5)
            .attr('d', l)
            .attr('marker-start', 'url(#peer-dot)')
            .attr('marker-end', 'url(#peer-dot)')
    svg.append('text')
        .attr('transform', `translate(${80}, ${height - 15})`)
        .attr('font-size', 9)
        .attr('class', 'num')
        .text('New Cases, Last 30 Days')

    //
    // EVENT LISTENING
    //
    
    function redraw(name) {

        // transition
        const t = d3.transition()
            .duration(750)
            .ease(d3.easeQuadOut)

        // FACT
        let dt = factData[name];
        let change = dt[0];
        let cases = dt[1];
        let deaths = dt[2];

        changeText.text(`${change}%`);
        changeText.transition(t).style('color', () => {
            if (Math.sign(change) == -1) {
                return g(lsg(change));
            } else {
                return r(lsr(change));
            }
        })
        casesText.text(`${cases}`);
        deathsText.text(`${deaths}`);

        // CHART

        // recalibrating scales
        const y = d3.scaleLinear()
            .domain([0, d3.max(data.new[`${name}`])])
            .range([height - margin.bottom, margin.top]);
        const l = d3.line()
            .x((d,i) => x(data.dates[i]))
            .y(d => y(d));

        // remaking y axis
        const yx = g => 
            g
                .attr("transform", `translate(${width - margin.right},0)`)
                    .attr('id', 'peer-axis')
                .call(d3.axisRight(y))
                .call(g => g.selectAll('.tick line')
                    .each(function(d,i) {
                        if (i%2 != 0) {d3.select(this).remove()}
                    }))
                    .attr('stroke-width', 0.3)
                .call(g => g.selectAll('.tick text')
                    .each(function(d,i) {
                        if (i%2 != 0) {d3.select(this).remove()}
                    }))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick text')
                    .attr('class', 'num')
                    .style('font-size', '8px'))
                .call(g => g.select('.tick:first-of-type').remove());
        svg.select('#peer-axis').remove();
        svg.append('g')
            .call(yx);

        // redrawing line
        line
            .datum(data.new[`${name}`])
                .transition(t)
                .attr('d', l)
                .attr('marker-end', 'url(#peer-dot)')
        
    }

    // starting London button as hovered
    d3.select('#peers nav a')
        .style('color', d3.schemeBlues[9][6]);

    // getting region buttons
    const regions = d3.selectAll('#peers nav a')
    regions
        .on('mouseenter', entered)
        .on('click', clicked)
        .on('mouseleave', left);

    function entered() {
        const region = d3.select(this);
        region.style('background-color', d3.schemeBlues[9][1]);
    }

    function left() {
        const region = d3.select(this);
        region.transition().style('background-color', '#fff');
    }

    function clicked() {
        const region = d3.select(this);
        const name = this.id.slice(5,);
        regions.style('color', 'black');
        region.style('color', d3.schemeBlues[9][6]);
        redraw(name);
    }
}

peerMain();
