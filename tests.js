d3.csv('./data/output/ml_test.csv')
    .then((data) => {
        let ml = [];
        let ont = [];
        let tests = [];
        let dates = [];

        for (i = data.length - 7; i > 0; i--) {
            let row = data[i];
            ml.push(+row.ml); 
            ont.push(+row.ont);
            tests.push(+row.ml_tests);
            dates.push(row.date);       
        }

        const dateParse = d3.timeParse('%b %d %Y');
        dates = dates.map(s => dateParse(s));

        // creating array of colours from data
        const c = d3.scaleSequential(d3.interpolateOrRd);
        const ls = d3.scaleLog()
            .domain([0.01, d3.max(ml)])
            .range([0.1, 0.8]);
        let fills = [];
        ml.forEach(e => {
            fills.push(c(ls(e)));
        })

        const dt = {
            ml: ml,
            ont: ont,
            dates: dates,
            tests: tests
        }
        
        draw(dt);

    })

function draw(data) {

    const width = 1000;
    const height = 600;
    const margin = {top: 40, right: 60, bottom: 50, left: 55};

    const svg = d3.select('#testing')
        .select('#testing-chart')
            .append('svg')
                .attr('viewBox', [0, 0, width, height]);

    // scales
    const x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.tests)])
        .range([height - margin.bottom, margin.top]);
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(data.ml)])
        .range([height - margin.bottom, margin.top]);

    // line functions
    const line = d3.area()
        .curve(d3.curveStep)
        .x((d,i) => x(data.dates[i]))
        .y0(y(0))
        .y1((d,i) => y(d));
    const area = d3.area()
        .curve(d3.curveStep)
        .x((d,i) => x(data.dates[i]))
        .y0(y2(0))
        .y1((d,i) => y2(d));

    //
    // AXES
    //

    const xx = g =>
        g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .ticks(10, d3.timeParse('%B')))
            .call(g => g.selectAll('.tick text')
                .attr('class', 'num')
                .style('font-size', '14px'));
    // rate axis on left
    const yxr = g => 
        g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y2))
            .call(g => g.selectAll('.tick text')
                .attr('class', 'num')
                .style('font-size', '14px'))
            .call(g => g.select('.tick:first-of-type').remove());
    // test axis on right
    const yxt = g => 
            g
                .attr("transform", `translate(${width - margin.right},0)`)
                .call(d3.axisRight(y))
                .call(g => g.selectAll('.tick text')
                    .attr('class', 'num')
                    .style('font-size', '14px'))
                .call(g => g.select('.tick:first-of-type').remove());

    svg.append('g')
        .call(xx);
    svg.append('g')
        .call(yxr);
    svg.append('g')
        .call(yxt);

    const tests = svg.append('path')
            .attr('id', 'test-line')
        .datum(data.tests)  
        // line: #08306B
        // purple: #E0DEFF
        // red: #E05F3C
            .attr('fill', '#E0DEFF')
            .attr('stroke-width', 2.5)
            .attr('stroke', d3.schemePurples[9][8])
            .attr('d', line);

    const rate = svg.append('path')
            .attr('id', 'rate-area')
        .datum(data.ml)
            .attr('fill', '#FA5332')
            .attr('stroke', d3.schemeReds[9][8])
            .attr('stroke-width', 2.5)
            .attr('opacity', 0.8)
            .attr('d', area);

    // tests
    //     .datum(data.ml)
    //         .transition()
    //             .duration(2000)
    //             .ease(d3.easeQuadIn)
    //                 .attr('fill', '#FA5332')
    //                 .attr('stroke', d3.schemeReds[9][8])
    //                 .attr('stroke-width', 2.5)
    //                 .attr('d', area);

}