import React, { useEffect, useRef } from 'react'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line } from 'd3-shape'
import './App.css'
import useSWR from 'swr'
import refreshIcon from './loop2.svg';
import { mutate } from "swr";

interface DataPoint {
  value: number;
  id: number;
  size: number;
}

const App: React.FC = () => {
  const svgRef = useRef<null | SVGSVGElement>(null);
  let { data } = useSWR<DataPoint[]>(window.location.search,
    async (params) => {
      const response = await fetch("https://pnw3gi739c.execute-api.us-east-1.amazonaws.com/production-stage/get_all_events" + params)
      const jsonResponse = await response.json()
      return jsonResponse["events"]
    }, { refreshInterval: 30000 }
  );


  useEffect(() => {
    if (svgRef == null || svgRef.current == null) {
      return;
    }

    let svg = select(svgRef.current);
    let width = svgRef.current.clientWidth - 50;
    let height = svgRef.current.clientHeight - 50;
    let xScale = scaleLinear()
      .domain([0, 50]) // input
      .range([25, width]); // output

    let yScale = scaleLinear()
      .domain([0, 5]) // input
      .range([height, 50]); // output

    let linePath = line<DataPoint>()
      .x(function (d) { return xScale(d.id) as number; }) // set the x values for the line generator
      .y(function (d) { return yScale(d.value) as number; }); // set the y values for the line generator


    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - 25) + ")")
      .call(axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(25,-25)")
      .call(axisLeft(yScale));
    if (data) {
      svg.select(".line").remove();
      svg.append("path")
        .datum(data) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", linePath) // 11. Calls the line generator
        .attr("fill", "none")
        .attr("pointer-events", "visibleStroke")
        .style("stroke", "black")
        .attr("stroke-width", "1px");

      svg.selectAll(".dot").remove();
      // 12. Appends a circle for each datapoint
      svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d) { return xScale(d.id) as number; })
        .attr("cy", function (d) { return yScale(d.value) as number; })
        .attr("r", function (d) { return d.size * 5 })
        .on("mouseover", function (a, b, c) {
          console.log(a);
        })
        .on("mouseout", function () { });
    }
  }, [data]);

  return (
    <div className="container">
      <svg id="journey-timeline" ref={svgRef} />
      <button id="refresh-button" onClick={() => mutate('url=https://www.notion.so/c9900066ef9543d986543f7db6594ae3?v=e1498ba37c6043dc9cda20aed703a3a7')}> <img alt="refresh graph" src={refreshIcon} /></button>
    </div>
  );
}

export default App;
