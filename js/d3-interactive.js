var margin = { top: 30, bottom: 40, left: 50, right: 40 };
var padding = { y: 10, yAxis: 10, tick: 10, top: 70 };

var width = 1024 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;

var svg = d3.select("#chartContainer")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// gradient line
var linearGradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "grad1")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%");
linearGradient
  .append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#448386")
  .attr("stop-opacity", "1");
linearGradient
  .append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#446086")
  .attr("stop-opacity", "1");

// Global Scale
var xScale = d3.scalePoint().rangeRound([margin.left, width]);
var yScale = d3.scaleLinear().range([height, margin.top + padding.top]).nice();

d3.csv("ov-stats.csv", (err, data) => {
  // if (error) return console.warn(error)
  var dataset = [];

  // Abbreviating d.Season with only last two digits of year
  function formatYear(str) {
    return str.split("-").map(a => a.replace(/^\d{2}(\d{2})$/, "$1")).join("-").concat("'");
  }

  data.forEach(d => {
    d.Season = formatYear(d.Season);
    d.dataset = +d.G;
    d.G = +d.G;
    d.A = +d.A;
    d.P = +d.P;
    d["+/-"] = +d["+/-"];
    d.PIM = +d.PIM;
    d.PPG = +d.PPG;
    d.SHG = +d.SHG;
    d.SHP = +d.SHG;
    d.GWG = +d.GWG;
    d.OTG = +d.OTG;
    d.S = +d.S;
    d["S%"] = +d["S%"];
    d["FO%"] = +d["FO%"];
    d.GP = +d.GP;
  });

  yScale.domain([0, d3.max(data, d => d.dataset) + padding.yAxis]).nice();
  xScale.domain(d3.set(data.map(d => d.Season)).values());

  // Creating the line
  var lineValue = d3.line()
    .x(d => xScale(d.Season))
    .y(d => yScale(d.dataset))
    .curve(d3.curveCatmullRom);

  svg.append("path")
    .attr("class", "chart_line")
    .attr("d", lineValue(data))
    .attr("fill", "none")
    .attr("stroke", "url(#grad1)")
    .attr("stroke-width", "3.5");

  var dots = svg
    .selectAll(".dots")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dots")
    .attr("r", 4)
    .attr("cx", function(d) {
      return xScale(d.Season);
    })
    .attr("cy", function(d) {
      return yScale(d.dataset);
    })
    .attr("fill", "#fff")
    .attr("stroke", "#C60C30")
    .attr("stroke-width", "3");

  // Axis & Scaling
  var xAxis = d3.axisBottom(xScale).tickPadding(padding.tick);
  var yAxis = d3.axisLeft(yScale).tickPadding(padding.tick);

  // Appending the SVG elements to index.html
  svg
    .append("g")
    .attr("class", "x axis chart-axis")
    .attr("transform", "translate(" + [0, height] + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis chart-axis")
    .attr("transform", "translate(" + [margin.left - padding.y, 0] + ")")
    .call(yAxis);

  // Labels
  svg
    .append("text")
    .attr("class", "y_label axis_labels")
    .attr("x", 0)
    .attr("y", padding.top)
    .text("Goals Scored");
  
  svg.append("text")
  	.attr("class", "x_label axis_labels")
  	.attr("x", width - margin.right)
  	.attr("y", height + 50)
  	.text("Regular Season");

  // on click, update with new data
  d3.selectAll(".dropdown-item").on("click", function() {
    var selectedStat = d3.select(this).attr("data-dropdown-value");
    data.forEach((d, i) => {
      d.dataset = d[selectedStat];
      if (d.dataset < 0) {
        d3.select('.y.axis').attr('id', 'axis-negative');
      }
    });

    //Update scale domains, check to see if d.dataset is negative and scale y-axis respectively
    if ($('.y.axis').is('#axis-negative')) {
      yScale.domain([d3.min(data, d => d.dataset), d3.max(data, d => d.dataset)]).nice()
      d3.select('.x.axis')
        .transition()
      	.duration(1000)
      	.attr('transform', 'translate(' + [0, yScale(0)] + ')')
    } else {
      yScale.domain([0, d3.max(data, d => d.dataset) + padding.yAxis]).nice();
      d3.select('.x.axis')
        .transition()
      	.duration(1000)
      	.attr('transform', 'translate(' + [0, height] + ')')
    }

    // Creating the line
    lineValue.y(d => yScale(d.dataset))
    	
    svg.select(".chart_line")
      .attr("d", lineValue(data))
      .transition()
      .on('start', function() {
				d3.select(this).attr("stroke-width", "5");
      })
      .duration(1000)
      .transition()
    	.on('end', function() {
      	d3.select(this).attr('stroke-width', '4')
      })
    	.duration(500)

    var dots = svg.selectAll(".dots")
      .data(data)
      .transition()
      .duration(750)
      .on("start", function() {
        d3.select(this).attr('stroke', 'none').attr("fill", "#F27D52").attr("r", 5);
      })
      .attr("cx", function(d) {
        return xScale(d.Season);
      })
      .attr("cy", function(d) {
        return yScale(d.dataset);
      })
      .transition()
      .duration(750)
      .on('end', function() {
        d3.select(this).attr("stroke", "rgb(198, 12, 48").attr('fill', '#fff').attr("r", 4)
      });

    //Update Y axis
    

    if ($('.y.axis').is('#axis-negative')) {
      // svg.select('#axis-negative').transition().duration(1000).call(yAxis)
      svg.select('#axis-negative').transition().duration(1000).call(yAxis)
    } else {
      svg.select(".y.axis").transition().duration(1000).call(yAxis);
    }
    
    d3.select('.y.axis').attr('id', 'null')
  });
});
