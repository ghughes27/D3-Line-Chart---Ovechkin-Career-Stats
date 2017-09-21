// Dimensions of svg
const margin = { top: 100, bottom: 40, left: 50, right: 40 };
const padding = { yAxis: 10, tick: 10, y: 50};
const width = 960;
const height = 500;
// Create and append svg container to #chartContainer
const svg = d3
  .select('#chartContainer')
  .append('svg')
  .attr('width', width - margin.left - margin.right)
  .attr('height', height - margin.top - margin.bottom)
  .attr('viewBox', '0 0 960 500')
  .attr('preserveAspectRatio', 'xMidYMid meet');
svg.append('g');
// gradient line - design
const linearGradient = svg
  .append('defs')
  .append('linearGradient')
  .attr('id', 'grad1')
  .attr('x1', '0%')
  .attr('y1', '0%')
  .attr('x2', '100%')
  .attr('y2', '0%');
linearGradient
  .append('stop')
  .attr('offset', '0%')
  .attr('stop-color', '#448386')
  .attr('stop-opacity', '1');
linearGradient
  .append('stop')
  .attr('offset', '100%')
  .attr('stop-color', '#446086')
  .attr('stop-opacity', '1');

// Tooltip
const div = d3.select("body")
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// Abbreviating d.Season with only last two digits of year
function formatYear(str) {
  return str
    .split('-')
    .map(a => a.replace(/^\d{2}(\d{2})$/, '$1'))
    .join('-')
    .concat("'");
}

// Global Scale
const x = d3.scalePoint().rangeRound([0, width]);
const y = d3
  .scaleLinear()
  .range([height, 0])
  .nice();
// Axis & Scaling
const xAxis = d3.axisBottom(x).tickPadding(padding.tick);
const yAxis = d3.axisLeft(y).tickPadding(padding.tick);

// READ CSV File
// Import and split data into different metrics
d3.csv('ov-stats.csv', (err, data) => {
  // if (error) return console.warn(error)
  const dataset = [];

  data.forEach(d => {
    d.Season = formatYear(d.Season);
    d.dataset = +d.G;
    d.G = +d.G;
    d.A = +d.A;
    d.P = +d.P;
    d['+/-'] = +d['+/-'];
    d.PIM = +d.PIM;
    d.PPG = +d.PPG;
    d.SHG = +d.SHG;
    d.SHP = +d.SHG;
    d.GWG = +d.GWG;
    d.OTG = +d.OTG;
    d.S = +d.S;
    d['S%'] = +d['S%'];
    d['FO%'] = +d['FO%'];
    d.GP = +d.GP;
  });

  y.domain([0, d3.max(data, d => d.dataset) + padding.yAxis]).nice();
  x.domain(d3.set(data.map(d => d.Season)).values());

  // Import the data for the line
  const lineValue = d3
    .line()
    .x(d => x(d.Season))
    .y(d => y(d.dataset))
    .curve(d3.curveCatmullRom);
  // Append the line chart to the svg
  const path = svg
    .append('path')
    .attr('class', 'chart_line')
    .attr('d', lineValue(data))
    .attr('fill', 'none')
    .attr('stroke', 'url(#grad1)')
    .attr('stroke-width', '4');

  // find the dropdown-current innerHTML value
  var nameAttr = document.querySelectorAll('.dropdown-current')[0]

  // Circles
  const dots = svg
    .selectAll('.dots')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dots')
    .attr('r', 6)
    .attr('cx', d => x(d.Season))
    .attr('cy', d => y(d.dataset))
    .attr('fill', '#fff')
    .attr('stroke', '#d65473')
    .attr('stroke-width', '4')
    .on('mouseover', d => {
      div
        .transition()
        .duration(400)
        .style('opacity', 0.9);
      div
        .html(`<span><span style="color:#c7c7c7">${nameAttr.innerHTML}:</span> ${d.dataset}</span>`)
        .style('left', `${d3.event.pageX + 20}px`)
        .style('top', `${d3.event.pageY - 20}px`);
    })
    .on('mouseout', d => {
      div
        .transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Append X Axis
  svg
    .append('g')
    .attr('class', 'x axis chart-axis')
    .attr('transform', `translate(${[0, height]})`)
    .call(xAxis)
    // Label
    .append('text')
    .attr('class', 'x_label axis_labels')
    .attr('x', width - margin.right)
    .attr('y', 50)
    .text('Regular Season');
  // Append Y Axis
  svg
    .append('g')
    .attr('class', 'y axis chart-axis')
    .attr('transform', `translate(${[0, 0]})`)
    .call(yAxis)
    // Label
    .append('text')
    .attr('class', 'y_label axis_labels')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', 6)
    .attr('dy', '1em')
    .style('text-anchor', 'end')
    .text("Goals scored");

  // ON CLICK
  // update values with new data
  d3.selectAll('.dropdown-item').on('click', function() {
    const selectedStat = d3.select(this).attr('data-dropdown-value');
    data.forEach((d, i) => {
      d.dataset = d[selectedStat];
      if (d.dataset < 0) {
        d3.select('.y.axis').attr('id', 'axis-negative');
      }

    });

    // Update scale domains, check to see if d.dataset is negative and scale y-axis respectively
    if ($('.y.axis').is('#axis-negative')) {
      y
        .domain([d3.min(data, d => d.dataset), d3.max(data, d => d.dataset)])
        .nice();
      d3
        .select('.x.axis')
        .transition()
        .duration(1000)
        .attr('transform', `translate(${[0, y(0)]})`);
    } else {
      y.domain([0, d3.max(data, d => d.dataset) + padding.yAxis]).nice();
      d3
        .select('.x.axis')
        .transition()
        .duration(1000)
        .attr('transform', `translate(${[0, height]})`);
    }

    // Creating the new line
    lineValue.y(d => y(d.dataset));

    svg
      .select('.chart_line')
      .transition()
      .on('start', function() {
        d3.select(this).attr('stroke-width', '5');
      })
      .duration(1000)
      .attr('d', lineValue(data))
      .transition()
      .duration(500)
      .on('end', function() {
        d3.select(this).attr('stroke-width', '4');
      });
    // Dots in motion
    const dots = svg
      .selectAll('.dots')
      .data(data)
      .transition()
      .duration(750)
      .on('start', function() {
        d3
          .select(this)
          .attr('stroke', '#73a0c5')
          .attr('fill', '#fff')
          .attr('r', 5);
      })
      .attr('cx', d => x(d.Season))
      .attr('cy', d => y(d.dataset))
      .transition()
      .duration(400)
      .on('end', function() {
        d3
          .select(this)
          .attr('stroke', '#d65473')
          .attr('fill', '#fff')
          .attr('r', 6);
      })


    // Update Y axis for +/- stat
    if ($('.y.axis').is('#axis-negative')) {
      // svg.select('#axis-negative').transition().duration(1000).call(yAxis)
      svg
        .select('#axis-negative')
        .transition()
        .duration(1000)
        .call(yAxis);
    } else {
      svg
        .select('.y.axis')
        .transition()
        .duration(1000)
        .call(yAxis)
    }

    d3.select('.y_label.axis_labels')
        .text(`${this.innerHTML}`)


    d3.select('.y.axis').attr('id', 'null');

  });
});
