// loading data & calling draw function
d3.csv('../../output/ml_general.csv')
    .then((data) => {
        
        // desired format is 3 labelled arrays
        let news = [];
        let avgs = [];

        for (i = data.length - 1; i > 0; i--) {
            let row = data[i];
            news.push(+row.new); 
            avgs.push(+row.avg);       
        }

        // today and dates
        const today = new Date(data[0].date);
        today.setDate(today.getDate() + 1);

        const dates = d3.timeDay.range(
            new Date(2020,1,25), today); 

        const dt = {
            new: news,
            avg: avgs,
            dates: dates
        };

        drawDaily(dt);

    })

function drawDaily(data) {

    // updating header
    const casesToday = data.new[data.new.length - 1];
    const avgToday = data.avg[data.avg.length - 1];
    const caseHed = d3.select('#daily h1').select('tspan');
    caseHed.text(casesToday);

    const width = 1000;
    const height = 600;
    const margin = {top: 30, right: 0, bottom: 50, left: 30};

    const blues = d3.schemeBlues[9];
    const barColour = blues[2];
    const lineColour = '#22456B';

    const svg = d3.select('#daily')
        .select('#daily-chart')
            .append('svg')
                .attr('viewBox', [0, 0, width, height]);

    // SCALES
    // two x scales
    const xBar = d3.scaleBand()
        .domain(d3.range(data.dates.length))
        .range([margin.left, width - margin.right])
        .padding(0.1);
    const xLine = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.new)])
        .range([height - margin.bottom, margin.top]);

    // DRAWING TOOLS
    // line function
    const line = d3.line()
        .curve(d3.curveStep)
        .x((d,i) => xLine(data.dates[i]))
        .y(d => y(d));
    // area underlying line
    const area = d3.area()
        .curve(d3.curveStep)
        .x((d,i) => xLine(data.dates[i]))
        .y0(y(0))
        .y1(d => y(d));

    // AXES
    const xx = g =>
        g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xLine)
                .ticks(10, d3.timeParse('%B')))
            .call(g => g.selectAll('.tick text')
                .style('font-size', '14px'));
    const yx = g => 
        g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            // .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick text')
                .style('font-size', '14px'))
            // .call(g => g.selectAll('.tick:not(:first-of-type) line')
            //     .attr('x2', width)
            //     .attr('stroke', '#dbdbdb')
            //     .attr('stroke-dasharray', '4 8')
            //     .attr('stroke-width', 0.7))
            .call(g => g.select('.tick:first-of-type').remove());
       
        // tooltip
       const frmt = d3.timeFormat('%b. %d')
       const today = frmt(data.dates[data.dates.length - 1]);
       const tip = svg.append('g')
               .attr('id', 'daily-tip')
               .attr('transform', `translate(${margin.left + 20}, 0)`)
       dateTip = tip.append('text')
               .attr('x', 0)
               .attr('y', 50)
               .attr('font-weight', 'bold')
               .text(`${today}:`)
       tip.append('circle')
               .attr('cx', 85)
               .attr('cy', 44)
               .attr('r', 7)
               .attr('fill', barColour)
       newTip = tip.append('text')
               .attr('x', 95)
               .attr('y', 50)
               .text(`${casesToday} new cases`)
       tip.append('circle')
               .attr('cx', 215)
               .attr('cy', 44)
               .attr('r', 7)
               .attr('fill', lineColour)
       avgTip = tip.append('text')
           .attr('x', 225)
           .attr('y', 50)
           .text(`${avgToday.toFixed(2)} average`)
    
    //
    // HOVER
    //

    function hover() {

        // event listeners
        svg
            .on('mouseenter', entered)
            .on('mousemove', moved)
            .on('mouseleave', left);  
        
        function entered() {
            bars.transition().attr('opacity', 0.3);
        }
        
        function moved() {

            // co-ords
            const xm = xLine.invert(d3.pointer(event, this)[0]);
            const ind = d3.bisectCenter(data.dates, xm);
            const di = data.dates[ind];
            const news = data.new[ind];
            const avgs = data.avg[ind];

            // highlighting bar
            bars
                .attr('opacity', (d,i) => {
                    let da = data.dates[i];
                    if (da == di) {return 1;}
                    else {return 0.3;}
                })
                .attr('fill', (d,i) => {
                    let da = data.dates[i];
                    if (da == di) {
                        return lineColour;
                    }
                    else {return barColour;}
                })
                .attr('width', (d,i) => {
                    let da = data.dates[i];
                    if (da == di) {
                        return xBar.bandwidth() + (xBar.bandwidth() / 3);
                    }
                    else {return xBar.bandwidth()}
                });

            // updating tooltip
            dateTip.text(`${frmt(di)}:`);
            newTip.text(`${news} new cases`);
            avgTip.text(`${avgs.toFixed(2)} average`);
        }

        function left() {
            bars.transition()
                .attr('opacity', 0.6)
                .attr('fill', barColour);
            dateTip.text(`${today}:`);
            newTip.text(`${casesToday} new cases`);
            avgTip.text(`${avgToday.toFixed(2)} average`);
        }
    }

    // 
    // DRAWING
    //    
    
    // axes
    svg.append('g').call(xx);
    svg.append('g').call(yx);

    // area under line
    const bg = svg.append('path')
            .attr('id', 'daily-area')
        .datum(data.avg)
            .attr('fill', barColour)
            .attr('opacity', 0.6)
            .attr('d', area);

    // drawing bars
    const bars = svg.append('g')
            .attr('id', 'bars')
        .selectAll('rect')
        .data(data.new)
        .join('rect')
            .attr('x', (d, i) => xBar(i))
            .attr('y', d => y(d))
            .attr('height', d => y(0) - y(d))
            .attr('width', xBar.bandwidth())
            .attr('fill', barColour)
            .attr('opacity', 1);
    
    // drawing line
    const path = svg.append('path')
        .attr('id', 'path')
        .datum(data.avg)
            .attr('fill', 'none')
            .attr('stroke', lineColour)
            .attr('opacity', 1)
            .attr('stroke-width', 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr('d', line);

    svg.call(hover);
    
}