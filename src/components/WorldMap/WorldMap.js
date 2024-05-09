import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import worldGeoJSON from './custom.geo.json';
import { Box, HStack, Select, VStack, Flex, Text, Center } from '@chakra-ui/react';

function WorldMap({ onCountryChange }) {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const legendRef = useRef();
    const [countryData, setCountryData] = useState({});
    const [countryValues, setCountryValues] = useState({});
    const [selectedCountry, setSelectedCountry] = useState(null); // State to track selected country
    const [value, setValue] = useState(null);
    const [hoveredCountry, setHoveredCountry] = useState(null); // State for the hovered country
    const worldPopulation = 7000000000;

    const width = 500;
    const height = 200;

    useEffect(() => {
        axios.get('http://localhost:5000/api/data/groupby?field=country')
            .then(response => {
                const valuesByCountry = response.data.reduce((acc, { country, value }) => {
                    acc[country] = value;
                    return acc;
                }, {});
                setCountryValues(valuesByCountry);

            })
            .catch(error => console.log(error));
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/api/data')
            .then(response => {
                const dataMap = response.data.reduce((acc, item) => {
                    acc[item.country] = { population: item.population_country };
                    return acc;
                }, {});

                setCountryData(dataMap);

            })
            .catch(error => console.log(error));
    }, []);

    useEffect(() => {
        if (Object.keys(countryValues).length === 0) return; // Wait for data before drawing

        const minVal = 1; // A log scale cannot start from 0
        const maxVal = Math.max(...Object.values(countryValues));

        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([Math.log(minVal), Math.log(maxVal)]); // Use logarithmic domain

        const projection = d3.geoNaturalEarth1()
            .scale(65)
            .translate([width / 2, height / 2]);

        const pathGenerator = d3.geoPath()
            .projection(projection);

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background-color', 'white');

        svg.selectAll('*').remove();

        // Draw the map
        svg.selectAll('path')
            .data(worldGeoJSON.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator)
            .attr('fill', d => {
                const countryName = d.properties.name_long;
                const value = countryValues[countryName];
                return value ? colorScale(Math.log(value)) : '#ddd';
            })
            .attr('stroke', d => selectedCountry === d.properties.name_long ? 'black' : 'none')
            .attr('stroke-width', d => selectedCountry === d.properties.name_long ? 2 : 0)
            .on("mouseover", (event, d) => {
                setHoveredCountry(d.properties.name_long);
                const countryName = d.properties.name_long;
                const value = countryValues[countryName];
                // d3.select(tooltipRef.current)
                //     .style('display', 'block')
                //     .text(`${countryName}: ${value ? value : 0}`);
                // setValue(value);
                d3.select(tooltipRef.current)
                    .style('display', 'absolute')
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 20 + 'px')
                    .text(`${countryName}: ${value}`);
            })
            .on("mouseout", (event, d) => {
                setHoveredCountry(null);
            })
            .style("cursor", "pointer")
            .on('click', (event, d) => {
                if (selectedCountry === d.properties.name_long) {
                    onCountryChange('none');
                    setSelectedCountry(null);
                    setValue(null);
                } else {
                    onCountryChange(d.properties.name_long);
                    const countryName = d.properties.name_long;
                    setSelectedCountry(d.properties.name_long);
                    const value = countryValues[countryName];
                    setValue(value);
                }
            });

        // If a country is selected, bring its border to the front
        if (selectedCountry) {
            svg.selectAll('path')
                .sort((a, b) => (a.properties.name_long === selectedCountry) ? 1 : -1);
        }

        // Add legend
        const legendScale = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([0, 100]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickSize(13)
            .tickValues(colorScale.ticks(8).map(t => Math.log(t)))
            .tickFormat(d => Math.round(Math.exp(d)));

        const legend = d3.select(legendRef.current);
        legend.selectAll('*').remove(); // Clear previous legend

        const lg = legend.attr('width', width)
            .attr('height', 40)
            .append('g')
            .attr('transform', `translate(30,10)`);

        lg.selectAll('rect')
            .data(colorScale.ticks(8).map(t => Math.log(t)))
            .enter().append('rect')
            .attr('height', 10)
            .attr('x', d => legendScale(d))
            .attr('width', legendScale(Math.log(minVal + (maxVal - minVal) / 8)) - legendScale(0))
            .attr('fill', colorScale);

        lg.call(legendAxis).select('.domain').remove();

    }, [countryValues, selectedCountry]);

    function formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    console.log(countryData[selectedCountry]);
    return (
        <VStack spacing={0}>
            <Box position="relative" boxShadow="base" rounded="md">
                <svg ref={svgRef}></svg>
                <br></br>
                {hoveredCountry && <Box ref={tooltipRef} ml="200px" textAlign="center" position="absolute" display="none" padding="8px" backgroundColor="rgba(255, 255, 255, 0.75)" border="1px solid black" borderRadius="4px" pointerEvents="none">
                    {/* Tooltip text will be set on hover */}
                </Box>}
                {/* <Box position="absolute" bottom="0" width="100%" textAlign="center" bg="white">
                    {hoveredCountry}
                </Box> */}
            </Box>
            <Flex direction="row" justify="space-between" mt={4} w="100%" h="100%">
                <Box w="32%" boxShadow="base" p={2} rounded="md">
                    <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="semibold">{selectedCountry ? selectedCountry : 'World'}</Text>
                        <Center w="full" fontSize="xl" fontWeight="bold">
                            {value ? formatNumber(value) : formatNumber(2000)}
                        </Center>
                    </VStack>
                </Box>
                <Box w="32%" boxShadow="base" p={2} rounded="md">
                    <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="semibold">Population</Text>
                        <Center w="full" fontSize="xl" fontWeight="bold">
                            {selectedCountry ? formatNumber(countryData[selectedCountry].population) : formatNumber(worldPopulation)}
                        </Center>
                    </VStack>
                </Box>
                <Box w="32%" boxShadow="base" p={2} rounded="md">
                    <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="semibold">Per Billion</Text>
                        <Center w="full" fontSize="xl" fontWeight="bold">
                            {value ? formatNumber(Math.round(value / (countryData[selectedCountry].population / 1000000000))) : formatNumber(Math.round(2000 / (worldPopulation / 1000000000)))}
                        </Center>
                    </VStack>
                </Box>
            </Flex>
        </VStack >
    );
}

export default WorldMap;