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
  [property: string]: string | number;
}

interface CompleteGraphData {
  data_points: DataPoint[];
  series: Map<string, number[]>;
}

const App: React.FC = () => {
  const svgRef = useRef<null | SVGSVGElement>(null);
  const searchLocation = window.location.search;

  let { data } = useSWR<CompleteGraphData>(searchLocation,
    async (params) => {
      const RESPONSE = await fetch("http://localhost:5000/line_graph" + params, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/jsson',
          'Cache': 'no-cache'
        },
        credentials: 'include'
      });
      const JSON_RESPONSE = await RESPONSE.json()
      return JSON_RESPONSE
    }, { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (svgRef == null || svgRef.current == null || !data) {
      return;
    }
    let dataPoints = data.data_points;
    let series = data.series;
    let dataFiltered = dataPoints.filter(dataPoint => dataPoint.x != null
      && dataPoint.y != null
      && dataPoint.size != null).reduce((dataMap: Map<number, DataPoint>, dataPoint: DataPoint): Map<number, DataPoint> => {
        dataMap.set(dataPoint.id, dataPoint);
        return dataMap;
      }, new Map<number, DataPoint>());

    //determine scales
    let findCalculatedMinAndMax = (dataFilteredArray: DataPoint[], property: string): number[] => {
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
        Math.min(...dataFilteredArray.map((dataPoint: DataPoint) => dataPoint[property] as number)),
        Math.max(...dataFilteredArray.map((dataPoint: DataPoint) => dataPoint[property] as number))
      );
    };
    const urlParams = new URLSearchParams(searchLocation);
    let processManualSetMinAndMax = (property: string): number => {
      return parseInt(urlParams.get(property) as string);
    };

    let findMinAndMax = (property: string, dataFiltered: Map<number, DataPoint>): number[] => {
      let urlParamMin = processManualSetMinAndMax(`${property}Min`);
      let urlParamMax = processManualSetMinAndMax(`${property}Max`);
      if (!urlParamMin || !urlParamMax) {
        let [min_calculated, max_calculated] = findCalculatedMinAndMax(Array.from(dataFiltered.values()), property);

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
      .range([5, 15]);

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
    let linePath = line<number>()
      .x(function (d) { return xScale((dataFiltered.get(d) as DataPoint).x) as number; })
      .y(function (d) { return yScale((dataFiltered.get(d) as DataPoint).y) as number; });
    if (series.size == 0) {
      series.set("All Data", Array.from(dataFiltered.keys()));
    }
    svg.select(".line").remove();
    (Array.from(series.values())).forEach((seriesArray) => {
      svg.append("path")
        .datum(seriesArray) //  Binds data to the line
        .attr("class", "line")
        .attr("d", linePath) // Calls the line generator
        .attr("fill", "none")
        .attr("pointer-events", "visibleStroke")
        .style("stroke", "black")
        .attr("stroke-width", "1px");
    });


    //create data points
    svg.selectAll(".dot").remove();
    svg.selectAll(".dot")
      .data(Object.values(dataFiltered) as DataPoint[])
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
