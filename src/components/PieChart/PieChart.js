import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Box } from '@chakra-ui/react';

function PieChart({ data }) {
    const svgRef = useRef();
    const svgWidth = 200;
    const svgHeight = 100;
    const radius = Math.min(svgWidth, svgHeight) / 2; // Radius of the pie chart

    useEffect(() => {
        console.log(data);
        if (!data || data.length === 0) return;

        // Set up the SVG canvas
        const svg = d3.select(svgRef.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .html('') // Clear previous renders
            .append('g')
            .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`);

        // Create a pie generator
        const pie = d3.pie()
            .value(d => d.value);

        // Create an arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        // Map genders to specific colors
        const color = d3.scaleOrdinal()
            .domain(["male", "female"])
            .range(["#2196F3", "#EC407A"]);

        // Append arcs for each data entry
        svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.gender));  // Use gender to determine color

        // Optionally, add labels to the arcs
        svg.selectAll('text')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle');
    }, [data]);

    return (
        <Box>
            <svg ref={svgRef}></svg>
        </Box>
    );
}

export default PieChart;
