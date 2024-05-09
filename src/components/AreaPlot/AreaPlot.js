import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Select } from '@chakra-ui/react';

const StackedAreaChart = () => {
    const ref = useRef(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/data'); // Replace with your actual API endpoint
                const jsonData = await response.json();
                // Transform data to aggregate by age groups and selfMade status
                const groupedData = aggregateData(jsonData);
                setData(groupedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const aggregateData = (data) => {
        const ageGroups = {}; // Group data by age range
        data.forEach(person => {
            const ageGroup = Math.floor(person.age / 10) * 10;
            if (!ageGroups[ageGroup]) {
                ageGroups[ageGroup] = { selfMadeTrue: 0, selfMadeFalse: 0 };
            }
            if (person.selfMade) {
                ageGroups[ageGroup].selfMadeTrue += 1;
            } else {
                ageGroups[ageGroup].selfMadeFalse += 1;
            }
        });
        return Object.keys(ageGroups).map(age => ({
            age: age,
            ...ageGroups[age]
        }));
    };

    useEffect(() => {
        if (!data.length) return;

        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Clear previous SVG
        d3.select(ref.current).selectAll("*").remove();

        const svg = d3.select(ref.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const stack = d3.stack()
            .keys(["selfMadeTrue", "selfMadeFalse"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const series = stack(data);

        const x = d3.scaleBand()
            .domain(data.map(d => d.age))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
            .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const area = d3.area()
            .x(d => x(d.data.age) + x.bandwidth() / 2)
            .y0(d => y(d[0]))
            .y1(d => y(d[1]));

        svg.selectAll(".layer")
            .data(series)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", area)
            .style("fill", (d, i) => color(i));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

    }, [data]);

    return (
        <Box boxShadow="base" rounded="md">
            <svg ref={ref}></svg>
        </Box>
    );
};

export default StackedAreaChart;
