//
// TABLE NUMBERS
//

d3.csv('data/output/ontario_change.csv')
    .then((data) => {
        drawTable(data[0]);
    })

function drawTable(data) {
    
    // adds % text to each spot in table
    Object.keys(data).forEach(region => {
        if (region != 'date') {

            // get numbers
            const c = data[region];
            const num = d3.select('#peer_table table')
                .select(`#table_${region} .table_change .grid-table-num`)
                    .append('p')
            const n = `${(c * 1).toFixed(0)}%`;

            // adding and colouring nums by sign
            if (Math.sign(c) == -1) {
                num.text(`${n}`);
                num.style('color', '#566B12');   
            }

            else {
                num.text(`+${n}`);
                num.style('color', '#CC3623');  
                
            }
        }
    })

}

//
// TABLE LINES
//

d3.csv('./data/ontario_new.csv')
    .then((data) => {

        data = data.slice(0,14);
        const dateParse = d3.timeParse('%Y-%m-%d');
        const regions = [
            'London','Durham','Halton','Hamilton',
            'Ottawa','Waterloo','Windsor'
        ];
        let dt = {
            dates: [],
            series: {
                'London': [],
                'Durham': [],
                'Halton': [],
                'Hamilton': [],
                'Ottawa': [],
                'Waterloo': [],
                'Windsor': [],
            }
        };

        for (r = data.length - 1; r > 0; r --) {
            const row = data[r];
            dt.dates.push(dateParse(row.date));
            regions.forEach(region => {
                dt.series[`${region}`].push(+row[`${region}`])
            })
        }

        regions.forEach(region => {
            drawArrows(region, dt);
        })
    })

function drawArrows(name, data) {

        // data
        const dates = data.dates;
        const series = data.series[`${name}`];
    
        // table svg
        const tableWidth = 300;
        const tableHeight = 75;
        const tableMargin = {top: 10, right: 15, bottom: 10, left: 20}
        const table = d3.select(`#table_${name} .grid-table-line`)
            .append('svg')
                .attr('viewBox', [0, 0, tableWidth, tableHeight]);

        // scales
        const x = d3.scaleUtc()
            .domain(d3.extent(dates))
            .range([tableMargin.left, tableWidth - tableMargin.right]);
        const y = d3.scaleLinear()
            .domain([0, d3.max(series)])
            .range([tableHeight - tableMargin.bottom, tableMargin.top]);
        const line = d3.line()
            .x((d,i) => x(dates[i]))
            .y(d => y(d))

        // arrow point
        const mw = 6;
        const mh = 6;
        const refX = mw / 2;
        const refY = mh / 2;
        const arrowPoints = [[0, 0], [0, 6], [6, 3]];
        table.append('defs')
            .append('marker')
                .attr('id', 'line-arrow')
                .attr('viewBox', [0, 0, mw, mh])
                .attr('refX', refX)
                .attr('refY', refY)
                .attr('markerWidth', mw)
                .attr('markerHeight', mh)
                .attr('orient', 'auto-start-reverse')
                .append('path')
                    .attr('d', d3.line()(arrowPoints))
                    .attr('stroke', 'black')
                    .attr('fill', 'black');
        
        // data join
        table.append('path')
            .datum(series)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', 4)
                .attr('d', line)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr('marker-end', 'url(#line-arrow)');

}