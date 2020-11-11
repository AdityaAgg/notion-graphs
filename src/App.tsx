import React, { useEffect, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line } from 'd3-shape'
import './App.css'
import useSWR from 'swr'
import refreshIcon from './loop2.svg';
import { mutate } from "swr";
import CSS from 'csstype';

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
  series: Record<string, number[]>;
  is_x_time: boolean;
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
  const [tooltipActive, setTooltipActive] = useState(() => {
    return {
      visibility: 'hidden',
      transform: "translate(0,0)"
    } as CSS.Properties;
  });

  const [tooltipContent, setTooltipContent] = useState(() => {
    return { title: "" }
  });

  useEffect(() => {
    if (svgRef == null || svgRef.current == null || !data) {
      return;
    }
    let dataPoints = data.data_points;
    let series = new Map(Object.entries(data.series));

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

    let xDomain = [xMin, xMax + Math.abs(xMax - xMin) * 0.1];
    let xRange = [25, width];
    let xScale = (data.is_x_time ? scaleTime(xDomain, xRange)
      : scaleLinear(xDomain, xRange));

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
    if (series.size === 0) {
      series.set("All Data", Array.from(dataFiltered.keys()));
    }

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
    svg.selectAll(".dot")
      .data(Array.from(dataFiltered.values()))
      .enter().append("circle")
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function (d) { return xScale(d.x) as number; })
      .attr("cy", function (d) { return yScale(d.y) as number; })
      .attr("r", function (d) { return sizeScale(d.size) as number })
      .on("mouseover", (event: any, dataPoint: DataPoint) => {
        setTooltipActive({
          transform: `translate(${xScale(dataPoint.x)}px, ${yScale(dataPoint.x)}px)`,
          visibility: "visible"
        });
        setTooltipContent({ title: dataPoint.title });
      })
      .on("mouseout", (event: any, dataPoint: DataPoint) => {
        setTooltipActive((tooltipActive) => {
          return {
            ...tooltipActive,
            visibility: "hidden"
          }
        });
      });
    return () => {
      svg.selectAll(".dot").remove();
      svg.select(".line").remove();
    }
  }, [data, searchLocation]);

  let tooltipMouseoverEventListener = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTooltipActive({
      ...tooltipActive,
      visibility: "visible"
    });
  };

  let tooltipMouseoutEventListener = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTooltipActive({
      ...tooltipActive,
      visibility: "hidden"
    });
  };



  return (
    <div className="container">
      <div id="graph-tooltip" style={tooltipActive} onMouseOut={tooltipMouseoutEventListener}
        onMouseOver={tooltipMouseoverEventListener}>{tooltipContent.title}</div>
      <svg id="journey-timeline" ref={svgRef} />
      <button id="refresh-button" onClick={() => mutate(searchLocation)}> <img alt="refresh graph" src={refreshIcon} /></button>
    </div>
  );
}

export default App;
