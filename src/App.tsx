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
  [x: string]: string | number;
}

const App: React.FC = () => {
  const svgRef = useRef<null | SVGSVGElement>(null);
  const searchLocation = window.location.search;
  let { data } = useSWR<DataPoint[]>(searchLocation,
    async (params) => {
      const RESPONSE = await fetch("https://l175wxlpxi.execute-api.us-east-1.amazonaws.com/production/line_graph" + params, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache': 'no-cache'
        },
        credentials: 'include'
      });
      const JSON_RESPONSE = await RESPONSE.json()
      return JSON_RESPONSE["data_points"]
    }, { refreshInterval: 30000 }
  );



  useEffect(() => {
    if (svgRef == null || svgRef.current == null || !data) {
      return;
    }

    let dataFiltered = data.filter(dataPoint => dataPoint.x != null
      && dataPoint.y != null
      && dataPoint.size != null);


    //determine scales
    let findCalculatedMinAndMax = (dataFiltered: DataPoint[], property: string): number[] => {
      let postProcessMinMax = (min: number, max: number) => {
        if (max === min) {
          if (max === 0)
            max += 1;
          else
            max += Math.abs(max) * 0.1;
        }
        return [min, max]
      }
      return postProcessMinMax(
        Math.min(...dataFiltered.map((dataPoint: DataPoint) => dataPoint[property] as number)),
        Math.max(...dataFiltered.map((dataPoint: DataPoint) => dataPoint[property] as number))
      );
    };
    const urlParams = new URLSearchParams(searchLocation);
    let processManualSetMinAndMax = (property: string): number => {
      return parseInt(urlParams.get(property) as string);
    };

    let findMinAndMax = (property: string, dataFiltered: DataPoint[]): number[] => {
      let urlParamMin = processManualSetMinAndMax(`${property}Max`);
      let urlParamMax = processManualSetMinAndMax(`${property}Min`);
      if (!urlParamMin || !urlParamMax) {
        let [min_calculated, max_calculated] = findCalculatedMinAndMax(dataFiltered, property);

        return [(urlParamMin) ? urlParamMin : min_calculated,
        (urlParamMax) ? urlParamMax : max_calculated];
      }
      return [urlParamMin, urlParamMax];
    };

    let [xMin, xMax] = findMinAndMax("x", dataFiltered);
    let [yMin, yMax] = findMinAndMax("y", dataFiltered);
    let [sizeMin, sizeMax] = findMinAndMax("size", dataFiltered);

    let svg = select(svgRef.current);
    let width = svgRef.current.clientWidth - 50;
    let height = svgRef.current.clientHeight - 50;
    let xScale = scaleLinear()
      .domain([xMin, xMax + Math.abs(xMax - xMin) * 0.1])
      .range([25, width]);

    let yScale = scaleLinear()
      .domain([yMin - 0.1 * Math.abs(yMax - yMin), yMax])
      .range([height, 65]);

    let sizeScale = scaleLinear()
      .domain([sizeMin, sizeMax + Math.abs(sizeMax - sizeMin) * 0.1])
      .range([3, 7]);

    //create axes
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(xScale));

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(25,0)")
      .call(axisLeft(yScale));

    //create line
    let linePath = line<DataPoint>()
      .x(function (d) { return xScale(d.x) as number; })
      .y(function (d) { return yScale(d.y) as number; });

    svg.select(".line").remove();
    svg.append("path")
      .datum(dataFiltered) //  Binds data to the line
      .attr("class", "line")
      .attr("d", linePath) // Calls the line generator
      .attr("fill", "none")
      .attr("pointer-events", "visibleStroke")
      .style("stroke", "black")
      .attr("stroke-width", "1px");


    //create data points
    svg.selectAll(".dot").remove();
    svg.selectAll(".dot")
      .data(dataFiltered)
      .enter().append("circle")
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function (d) { return xScale(d.x) as number; })
      .attr("cy", function (d) { return yScale(d.y) as number; })
      .attr("r", function (d) { return sizeScale(d.size) as number })
      .on("mouseover", function (a) {
        console.log(a);
      })
      .on("mouseout", function () { });

  }, [data, searchLocation]);

  return (
    <div className="container">
      <svg id="journey-timeline" ref={svgRef} />
      <button id="refresh-button" onClick={() => mutate(searchLocation)}> <img alt="refresh graph" src={refreshIcon} /></button>
    </div>
  );
}

export default App;
