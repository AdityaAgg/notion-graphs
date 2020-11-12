import React, { useEffect, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line } from 'd3-shape'
import './App.scss'
import useSWR from 'swr'
import refreshIcon from './loop2.svg';
import { mutate } from "swr";
import CSS from 'csstype';
import { Redirect } from 'react-router-dom'

interface DataPoint {
  index: number;
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

const LineGraph: React.FC = () => {
  const searchLocation = window.location.search;
  const svgRef = useRef<null | SVGSVGElement>(null);
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
      if (RESPONSE.status === 400) {
        throw JSON_RESPONSE
      }
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
    return { title: "", activeElement: null as unknown as undefined | HTMLElement }
  });

  useEffect(() => {
    if (svgRef == null || svgRef.current == null || !data) {
      return;
    }
    let dataPoints = data.data_points;
    let series = new Map(Object.entries(data.series));

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

    let findMinAndMax = (property: string, dataPoints: DataPoint[]): number[] => {
      let urlParamMin = processManualSetMinAndMax(`${property}Min`);
      let urlParamMax = processManualSetMinAndMax(`${property}Max`);
      if (!urlParamMin || !urlParamMax) {
        let [min_calculated, max_calculated] = findCalculatedMinAndMax(Array.from(dataPoints), property);

        return [(urlParamMin) ? urlParamMin : min_calculated,
        (urlParamMax) ? urlParamMax : max_calculated];
      }
      return [urlParamMin, urlParamMax];
    };

    let [xMin, xMax] = findMinAndMax("x", dataPoints);
    let [yMin, yMax] = findMinAndMax("y", dataPoints);
    let [sizeMin, sizeMax] = findMinAndMax("size", dataPoints);

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
      .x(function (d) { return xScale((dataPoints[d] as DataPoint).x) as number; })
      .y(function (d) { return yScale((dataPoints[d] as DataPoint).y) as number; })

    if (series.size === 0) {
      series.set("All Data", dataPoints.map((dataPoint) => dataPoint.index));
    }

    (Array.from(series.entries())).forEach((seriesTuple) => {
      let seriesArray = seriesTuple[1];
      svg.append("path")
        .datum(seriesArray) //  Binds data to the line
        .attr("class", "line")
        .attr("d", linePath) // Calls the line generator
        .attr("fill", "none")
        .attr("pointer-events", "visibleStroke")
        .style("stroke", "black")
        .attr("stroke-width", "1px")
        .on("mouseover", (event: any, datum) => {
          setTooltipActive({
            transform: `translate(${event.clientX - 10}px, ${event.clientY - 10}px)`,
            visibility: "visible"
          });
          setTooltipContent({ title: seriesTuple[0], activeElement: event.currentTarget });
          svgRef.current?.classList.add("faded");
        }).on("mouseout", (event: any, datum) => {
          setTooltipActive((tooltipActive) => {
            return {
              ...tooltipActive,
              visibility: "hidden"
            }
          });
          svgRef.current?.classList.remove("faded");
        });

    });


    //create data points
    svg.selectAll(".dot")
      .data(Array.from(dataPoints))
      .enter().append("circle")
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function (d) { return xScale(d.x) as number; })
      .attr("cy", function (d) { return yScale(d.y) as number; })
      .attr("r", function (d) { return sizeScale(d.size) as number })
      .on("mouseover", (event: any, dataPoint: DataPoint) => {
        setTooltipActive({
          transform: `translate(${xScale(dataPoint.x)}px, ${yScale(dataPoint.y)}px)`,
          visibility: "visible"
        });
        setTooltipContent({ title: dataPoint.title, activeElement: event.currentTarget });
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
    tooltipContent.activeElement?.classList.add("active");
    if (tooltipContent.activeElement?.classList.contains("line"))
      svgRef.current?.classList.add("faded");
  };

  let tooltipMouseoutEventListener = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTooltipActive({
      ...tooltipActive,
      visibility: "hidden"
    });
    tooltipContent.activeElement?.classList.remove("active");
    svgRef.current?.classList.remove("faded");
  };

  return (
    <div className="container">
      {
        !document.cookie.includes("token_v2") &&
        <Redirect push
          to={{
            pathname: "/login",
            state: { from: searchLocation }
          }}
        />
      }
      <div id="graph-tooltip" style={tooltipActive} onMouseOut={tooltipMouseoutEventListener}
        onMouseOver={tooltipMouseoverEventListener}>{tooltipContent.title}</div>
      <svg id="journey-timeline" ref={svgRef} />
      <button id="refresh-button" onClick={() => mutate(searchLocation)}> <img alt="refresh graph" src={refreshIcon} /></button>
    </div>
  );
}

export default LineGraph;
