d3.csv('../../output/ontario_new.csv')
    .then(data => {
        // JS is disgusting:
        data = data.reverse().slice(35,).filter(e => data.indexOf(e) != 185);

        // dates
        const dateParse = d3.timeParse('%Y-%m-%d');
        const dates = Array.from(d3.group(data, d => dateParse(d.date))
            .keys()).sort(d3.ascending);

        // series
        let series = [];
        const regions = [
            'London','Durham','Halton','Hamilton',
            'Ottawa','Waterloo','Windsor'
        ].reverse();
        regions.forEach(region => {
            let s = [];
            data.forEach(row => {
                s.push(+row[`${region}_7`]);
            })
            series.push({
                name: region,
                values: s
            })
        })

        const dt = {
            dates: dates,
            series: series
        }

        drawJoy(dt);

    })

function drawJoy(data) {

    const width = 1000;
    const height = data.series.length * 90;
    const margin = {top: 250, right: 20, bottom: 30, left: 75};
    const overlap = 4;

    const svg = d3.select('#joy-chart')
        .append('svg')
            .attr('viewBox', [0, 0, width, height]);

    // scales
    const x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right]);
    const y = d3.scalePoint()
        .domain(data.series.map(d => d.name))
        .range([margin.top, height - margin.bottom]);
    const z = d3.scaleLinear()
        .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([0, -overlap * y.step()]);

    // functions
    const area = d3.area()
        .curve(d3.curveStep)
        .x((d,i) => x(data.dates[i]))
        .y0(0)
        .y1(d => z(d));
    const line = area.lineY1();
    
    // axes
    const xx = g =>
        g
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick text')
                .style('font-size', 16));
    const yx = g =>
        g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll('.tick text')
                .style('font-size', 16)
                .style('font-weight', 'bold'));

    // data join
    svg.append('g')
        .call(xx);
    svg.append('g')
        .call(yx);

    const rows = svg.append('g')
            .attr('id', 'joy-rows')
        .selectAll('g')
        .data(data.series)
        .join('g')
            .attr('transform', d => `translate(0, ${y(d.name) + 5})`)
            .attr('id', d => `joy-${d.name}`);

    rows.append('path')
        .attr('fill', d3.schemeBlues[9][2])
        .attr('d', d => area(d.values));
    rows.append("path")
        .attr("fill", "none")
        .attr("stroke", '#19334F')
        .attr('stroke-width', 2.5)
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values));

}