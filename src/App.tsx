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
  id: number;
  x: number;
  y: number;
  size: number;
  title: string;
}

const App: React.FC = () => {
  const svgRef = useRef<null | SVGSVGElement>(null);
  const searchLocation = window.location.search;
  let { data } = useSWR<DataPoint[]>(searchLocation,
    async (params) => {
      const response = await fetch("https://l175wxlpxi.execute-api.us-east-1.amazonaws.com/production/line_graph" + params)
      const jsonResponse = await response.json()
      return jsonResponse["data_points"]
    }, { refreshInterval: 30000 }
  );


  useEffect(() => {
    if (svgRef == null || svgRef.current == null) {
      return;
    }


    if (!data) {
      return;
    }
    data = data.filter(data_point => data_point.x != null && data_point.y != null && data_point.size != null);
    let findMinAndMax = (data: any, property: string) => {
      let postProcessMinMax = (min: any, max: any) => {
        if (max === min) {
          if (max === 0)
            max += 1;
          else
            max += Math.abs(max) * 0.1;
        }
        return [min, max]
      }
      return postProcessMinMax(Math.min(...data.map((dataPoint: any) => dataPoint[property])),
        Math.max(...data.map((dataPoint: any) => dataPoint[property])));
    };

    let [x_min, x_max] = findMinAndMax(data, "x");
    let [y_min, y_max] = findMinAndMax(data, "y");

    let svg = select(svgRef.current);
    let width = svgRef.current.clientWidth - 50;
    let height = svgRef.current.clientHeight - 50;
    let xScale = scaleLinear()
      .domain([x_min, x_max + Math.abs(x_max - x_min) * 0.1])
      .range([25, width]);

    let yScale = scaleLinear()
      .domain([y_min - 0.1 * Math.abs(y_max - y_min), y_max])
      .range([height, 50]);

    let linePath = line<DataPoint>()
      .x(function (d) { return xScale(d.x) as number; }) // set the x values for the line generator
      .y(function (d) { return yScale(d.y) as number; }); // set the y values for the line generator


    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - 25) + ")")
      .call(axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(25,-25)")
      .call(axisLeft(yScale));

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
      .attr("cx", function (d) { return xScale(d.x) as number; })
      .attr("cy", function (d) { return yScale(d.y) as number; })
      .attr("r", function (d) { return d.size * 5 })
      .on("mouseover", function (a) {
        console.log(a);
      })
      .on("mouseout", function () { });

  }, [data]);

  return (
    <div className="container">
      <svg id="journey-timeline" ref={svgRef} />
      <button id="refresh-button" onClick={() => mutate(searchLocation)}> <img alt="refresh graph" src={refreshIcon} /></button>
    </div>
  );
}

export default App;
