import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const Pcp = () => {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const svgRef = useRef(null);
    const svgContainerRef = useRef(null);
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 10, bottom: 10, left: 10 };

    const dimensions = ["age", "country", "finalWorth", "gross_tertiary_education_enrollment", "industries", "population_country"];

    // Fetching data only once on component mount
    useEffect(() => {
        axios.get('http://localhost:5000/api/pcp-data')
            .then(response => {
                setData(response.data);
                setOriginalData(response.data);
            })
            .catch(error => {
                console.error('Error fetching PCP data:', error);
            });
    }, []);

    // Handling SVG rendering and updates
    useEffect(() => {
        if (!svgRef.current || data.length === 0) {
            return;
        }

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .selectAll("g").data([null]);
        const gEnter = svg.enter().append("g");
        const g = svg.merge(gEnter).attr('transform', `translate(${margin.left},${margin.top})`);

        g.selectAll("*").remove(); // Clear the SVG to prevent duplication

        let y = {};
        dimensions.forEach(dimension => {
            y[dimension] = typeof data[0][dimension] === 'string' ?
                d3.scalePoint().domain(data.map(d => d[dimension]).sort()).range([height, 0]) :
                d3.scaleLinear().domain(d3.extent(data, d => +d[dimension])).range([height, 0]);
        });

        let x = d3.scalePoint().range([0, width]).padding(1).domain(dimensions);

        const line = d3.line()
            .x(d => x(d.key))
            .y(d => y[d.key](d.value));

        const path = (d) => line(dimensions.map(p => ({ key: p, value: d[p] })));

        g.selectAll('.line')
            .data(data)
            .enter().append('path')
            .attr('class', 'line')
            .attr('d', path)
            .style('fill', 'none')
            .style('stroke', 'steelblue')
            .style('opacity', 0.5);

        const axis = g.selectAll('.dimension')
            .data(dimensions)
            .enter().append('g')
            .attr('class', 'dimension')
            .attr('transform', d => `translate(${x(d)})`);

        axis.append('g')
            .each(function (d) { d3.select(this).call(d3.axisLeft(y[d])); })
            .append('g')
            .attr('class', 'brush')
            .each(function (d) {
                d3.select(this).call(d3.brushY()
                    .extent([[-8, 0], [8, height]])
                    .on("brush end", event => brush(event, d)));
            });

        axis.append('text')
            .style('text-anchor', 'middle')
            .attr('y', -9)
            .text(d => d)
            .style('fill', 'black');

        function brush(event, dimension) {
            if (event.selection) {
                const [yMax, yMin] = event.selection.map(y[dimension].invert, y[dimension]);
                const filtered = originalData.filter(d => d[dimension] >= yMin && d[dimension] <= yMax);
                if (event.type === "end") { // Apply filtering only at the end of the brushing
                    setData(filtered);
                }
            }
        }
    }, [data]); // This dependency ensures that SVG updates only when data changes

    return (
        <div>
            <h1>Parallel Coordinates Plot</h1>
            <div ref={svgContainerRef} style={{ width: '100%', height: '500px' }}>
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default Pcp;
