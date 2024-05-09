import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import axios from 'axios';
import { Box, HStack, Text, VStack, Flex } from '@chakra-ui/react';
import PieChart from '../PieChart/PieChart';
import Gender from './Gender';
import Stats from './Stats';

const WordCloud = ({ selectedCountry, barPlot, bar }) => {
    const ref = useRef();
    const [data, setData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const population = 7000000000;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/word-cloud');
                setData(response.data);  // Ensure your data includes 'personName' and 'finalWorth'
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Fetch data dynamically based on props
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/word-cloud?country=${selectedCountry}&industry=${bar}`);
                console.log(response.data);
                setData(response.data);  // Ensure your data includes 'personName' and 'finalWorth'
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

        axios.get(`http://localhost:5000/api/data/pie?field=gender&country=${selectedCountry}&${barPlot}=${bar}`)
            .then(response => {
                setPieData(response.data); // Expect data like [{gender: "male", value: x}, {gender: "female", value: y}]
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [selectedCountry, bar]);

    useEffect(() => {
        if (data.length === 0) {
            return;
        }

        const width = 500;
        const height = 200;
        const fill = d3.scaleOrdinal(d3.schemeCategory10);

        // Calculate the domain for the scale based on the data
        const sizeScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.finalWorth), d3.max(data, d => d.finalWorth)])
            .range([10, 40]);  // Font size range from 10px to 40px
        const layout = cloud()
            .size([width, height])
            .words(data.map(d => ({ text: d.personName, size: sizeScale(d.finalWorth) })))
            .padding(20)
            .rotate(0)  // No rotation for better readability
            .font("Impact")
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();

        function draw(words) {
            const svg = d3.select(ref.current)
                .attr('width', width)
                .attr('height', height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("style", "width: 100%; height: auto;");
            svg.selectAll("*").remove();

            const wordGroup = svg.append("g")
                .attr('transform', `translate(${width / 2},${height / 2})`);

            wordGroup.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "Impact")
                .style("fill", (d, i) => fill(i))
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x}, ${d.y})`)
                .text(d => d.text);
        }
    }, [data, pieData]);

    function getMalePercentage() {

        if (!pieData[0]) return -1;
        const male = pieData[0]?.value ? pieData[0]?.value : 0;
        const female = pieData[1]?.value ? pieData[1]?.value : 0;
        return Math.round((male / (male + female)) * 100);
    }

    return (pieData && pieData.length > 0 && <VStack spacing={4}>
        <Box boxShadow="base" rounded="md">
            <svg ref={ref}></svg>
        </Box>
        <Flex>
            <Box width="100%">
                <Gender malePercentage={getMalePercentage()} femalePercentage={100 - getMalePercentage()} selectedCountry={selectedCountry} data={pieData} />
            </Box>
            {/* <Box flex="3">
                <Stats value={10} />
            </Box> */}
        </Flex>
    </VStack>
    );
};

export default WordCloud;
