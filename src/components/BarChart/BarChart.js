import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Box, Center, Select, Text } from '@chakra-ui/react';

function BarChart({ selectedCountry, onBarSelected, onBarPlotSelected }) {
    const svgRef = useRef();
    const svgWidth = 500;
    const svgHeight = 265;
    const margin = { top: 0, right: 30, bottom: 90, left: 90 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const [data, setData] = useState([]);
    const [selectedVariable, setSelectedVariable] = useState("industries");
    const [selectedBar, setSelectedBar] = useState(null);  // State to track the selected bar

    useEffect(() => {
        axios.get(`http://localhost:5000/api/data/groupby?field=${selectedVariable}&country=${selectedCountry}`)
            .then(response => {
                let sortedData = response.data.sort((a, b) => b.value - a.value);
                let topCountries = sortedData.slice(0, 20);
                let otherCountries = sortedData.slice(20);

                let othersAggregate = otherCountries.reduce((acc, curr) => {
                    acc.value += curr.value;
                    return acc;
                }, { country: 'Others', value: 0 });

                if (otherCountries.length > 0) {
                    topCountries.push(othersAggregate);
                }

                setData(topCountries);
            })
            .catch(error => console.log(error));
    }, [selectedVariable, selectedCountry]);

    // useEffect(() => {
    //     if (data.length === 0) return;

    //     const svg = d3.select(svgRef.current)
    //         .attr("width", svgWidth)
    //         .attr("height", svgHeight)
    //         .style("background-color", 'white')
    //         .style("overflow", "visible");

    //     svg.selectAll("*").remove();

    //     const xScale = d3.scaleBand()
    //         .domain(data.map(d => d[selectedVariable]))
    //         .range([0, width])
    //         .padding(0.2);

    //     const yScale = d3.scaleLinear()
    //         .domain([0, d3.max(data, d => d.value)])
    //         .range([height, 0]);

    //     const g = svg.append("g")
    //         .attr("transform", `translate(${margin.left},${margin.top})`);

    //     const bars = g.selectAll(".bar")
    //         .data(data)
    //         .enter()
    //         .append("rect")
    //         .attr("class", "bar")
    //         .attr("x", d => xScale(d[selectedVariable]))
    //         .attr("y", d => yScale(d.value))
    //         .attr("width", xScale.bandwidth())
    //         .attr("height", d => height - yScale(d.value))
    //         .attr("fill", d => selectedBar === d[selectedVariable] ? "#ff6347" : "#3182bd")  // Highlight selected bar
    //         .on("click", (event, d) => {
    //             if (selectedBar === d[selectedVariable]) {
    //                 setSelectedBar(null);
    //                 onBarSelected(null);
    //             } else {
    //                 setSelectedBar(d[selectedVariable]);
    //                 onBarSelected(d[selectedVariable]);
    //             }
    //         });

    //     g.append("g")
    //         .attr("transform", `translate(0,${height})`)
    //         .call(d3.axisBottom(xScale))
    //         .selectAll("text")
    //         .attr("transform", "rotate(-45)")
    //         .attr("text-anchor", "end")
    //         .attr("dx", "-.8em")
    //         .attr("dy", ".15em");

    //     g.append("g")
    //         .call(d3.axisLeft(yScale));

    //     g.selectAll(".label")
    //         .data(data)
    //         .enter()
    //         .append("text")
    //         .text(d => d.value)
    //         .attr("x", d => xScale(d[selectedVariable]) + xScale.bandwidth() / 2)
    //         .attr("y", d => yScale(d.value) - 5)
    //         .attr("text-anchor", "middle")
    //         .attr("font-size", "12px")
    //         .attr("fill", "black");

    // }, [data, selectedVariable, selectedCountry, selectedBar]);  // Include selectedBar in the dependency array

    useEffect(() => {
        if (data.length === 0) return;

        const svg = d3.select(svgRef.current)
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .style("background-color", 'white')
            .style("overflow", "visible");

        svg.selectAll("*").remove();

        const xScale = d3.scaleBand()
            .domain(data.map(d => d[selectedVariable]))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const bars = g.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[selectedVariable]))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", d => selectedBar === d[selectedVariable] ? "#ff6347" : "#3182bd")  // Highlight selected bar
            .on("click", (event, d) => {
                if (selectedBar === d[selectedVariable]) {
                    setSelectedBar(null);
                    onBarSelected(null);
                } else {
                    setSelectedBar(d[selectedVariable]);
                    onBarSelected(d[selectedVariable]);
                }
            })
            // Event listeners for showing value on hover
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr('opacity', 0.7); // Optional: change opacity on hover
                g.append("text")
                    .attr("class", "value")
                    .attr("x", xScale(d[selectedVariable]) + xScale.bandwidth() / 2)
                    .attr("y", yScale(d.value) - 10)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .attr("font-weight", "bold")
                    .text(d.value);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr('opacity', 1); // Optional: reset opacity
                g.selectAll(".value").remove();  // Remove the value on mouse out
            });

        g.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom + 40) // Adjust this value to position the label correctly
            .attr('text-anchor', 'middle');

        // Add y-axis label
        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -margin.left + 50) // Adjust this value to position the label correctly
            .attr('text-anchor', 'middle')
            .text('Count');

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        g.append("g").call(d3.axisLeft(yScale));

    }, [data, selectedVariable, selectedCountry, selectedBar]);

    return (
        <Box boxShadow="base" rounded="md">
            <Center mt="10px">
                <Text fontWeight="bold">Distribution By Industry</Text>
            </Center>

            {/* <Select placeholder='Select option' ml="90px" width='60%' onChange={(e) => {
                onBarPlotSelected(e.target.value);
                setSelectedVariable(e.target.value);
            }} value={selectedVariable}>
                <option value='industries'>Industry</option>
                <option value='country'>Country</option>
                <option value='gender'>Gender</option>
                <option value='selfMade'>Self Made</option>
            </Select> */}
            <br></br>
            <svg ref={svgRef}></svg>
        </Box>
    );
}

export default BarChart;
