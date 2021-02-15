d3.csv('./data/output/london_ages.csv')
    .then(data => {

        const series = d3.stack() 
            .keys(data.columns.slice(1))
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut)(data);
        const parse = d3.timeParse('%Y-%m-%d')
        const dates = data.map(d => parse(d.date))
        drawDemo(dates, data,series);

    })

function drawDemo(dates, data, series) {

    // // agnes martin blue palette:
    // const palette = [
    //     '#BBD4ED',
    //     '#A3BDE0',
    //     '#7799CE',
    //     '#5278B5',
    //     '#245598',
    //     '#074085',
    //     '#15367B'
    // ]
    // // color interpolator
    // const c = d3.interpolateLab(palette[0], palette[6]);
    // log scale to convert 9 colours to t value for inp
    const c = d3.interpolateYlGnBu;
    const cs = d3.schemePuBu[9];
    const ls = d3.scaleLog()
        .domain([1,9])
        .range([0.1, 0.7]);

    const width = 1000;
    const height = 600;
    const margin = {top: 50, right: 42, bottom: 50, left: 40};

    const svg = d3.select('#demo')
        .select('#demo-chart')
            .append('svg')
                .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([margin.left, width - margin.right])
    const y = d3.scaleLinear()
        .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
        .range([height - margin.bottom, margin.top]);

    const xx = g =>
        g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .ticks(10, d3.timeParse('%B')))
            .call(g => g.selectAll('.tick text')
                .attr('class', 'num')
                .style('font-size', '14px'));
    const yxl = g => 
        g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y)
                .tickFormat(d => { return `${d*100}%`}))
            .call(g => g.selectAll('.tick text')
                .attr('class', 'num')
                .style('font-size', '14px'))
                    .call(g => g.select('.tick:first-of-type').remove());
    const yxr = g => 
        g
            .attr("transform", `translate(${width - margin.right},0)`)
            .call(d3.axisRight(y)
                .tickFormat(d => { return `${d*100}%`}))
            .call(g => g.selectAll('.tick text')
                .attr('class', 'num')
                .style('font-size', '14px'))
                    .call(g => g.select('.tick:first-of-type').remove());
    
    const area = d3.area()
        .curve(d3.curveNatural)
        .x((d,i) => x(dates[i]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))

    svg.append('g')
        .call(xx);
    svg.append('g')
        .call(yxl);
    svg.append('g')
        .call(yxr);

    svg.append('g')
        .selectAll('path')
        .data(series)
        .join('path')
            .attr('fill', (d,i) => {
                return c(ls(i+1));
            })
            .attr('stroke', (d,i) => {
                return 'white';
            })
            .attr('stroke-width', 1)
            .attr('d', area);

}