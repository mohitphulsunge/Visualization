import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BarChart from './components/BarChart/BarChart';
import WorldMap from './components/WorldMap/WorldMap';
import { ChakraProvider, Button, HStack, Box, VStack, Text } from '@chakra-ui/react';
import PieChart from './components/PieChart/PieChart';
import Pcp from './components/PCP/PCP';
import WordCloud from './components/WordCloud/WordCloud';
import StackedAreaChart from './components/AreaPlot/AreaPlot';

function App() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("none");
  const [barSelected, setBarSelected] = useState("none");
  const [barPlotSelected, setBarPlotSelected] = useState("industry");
  const [selectedVariables, setSelectedVariables] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/data')
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.log(error));
  }, []);

  const onCountryChange = (country) => {
    setSelectedCountry(country);
  }
  const onBarSelected = (bar) => {
    if (bar === null) {
      setBarSelected("none");
    } else {
      setBarSelected(bar);
    }
  }
  const onBarPlotSelected = (plot) => {
    setBarPlotSelected(plot);
  }

  return (
    <ChakraProvider>
      <VStack spacing={4} align="stretch">
        <Box p={5}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">Billionaires</Text>
        </Box>
        <VStack spacing={30}>
          <HStack justifyContent="space-around">
            <WorldMap onCountryChange={onCountryChange} />
            <BarChart selectedCountry={selectedCountry} onBarSelected={onBarSelected} onBarPlotSelected={onBarPlotSelected} />
            {/* <PieChart selectedCountry={selectedCountry} barPlot={barPlotSelected} bar={barSelected} /> */}
            <WordCloud selectedCountry={selectedCountry} barPlot={barPlotSelected} bar={barSelected} />
          </HStack>
          {/* <Pcp selectedVariables={selectedVariables} /> */}
          <StackedAreaChart />
        </VStack>
      </VStack>
    </ChakraProvider>
  );
}

export default App;

