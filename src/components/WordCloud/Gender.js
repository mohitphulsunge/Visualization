import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { FaMale, FaFemale } from 'react-icons/fa'; // FontAwesome icons
import React, { useEffect, useState } from 'react';
import PieChart from '../PieChart/PieChart';
import { useSpring, animated } from 'react-spring';

const Gender = ({ malePercentage, femalePercentage, selectedCountry, barPlot, bar, data }) => {
    // useState[current, setCurrent] = useState(0);

    // useEffect(() => {

    // }, [malePercentage]);
    function Number({ newNum, oldNum }) {
        const { number } = useSpring({
            from: { number: oldNum },
            number: newNum,
            delay: 50,
            config: { mass: 1, tension: 20, friction: 10 },
        });
        return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>
    }
    return (
        <Box p={2} boxShadow="base" rounded="md" bg="white">
            <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center">
                    <Icon as={FaMale} color="blue.500" mr={2} w={8} h={8} />
                    <Text fontWeight="bold" fontSize="20px" color="blue.500" ml={2}>Male {malePercentage}%</Text>
                </Flex>
                <PieChart selectedCountry={selectedCountry} barPlot={barPlot} bar={bar} data={data} />
                <Flex alignItems="center">
                    <Icon as={FaFemale} color="pink.400" mr={2} w={8} h={8} />
                    <Text fontWeight="bold" fontSize="20px" color="pink.400" mr={2}>Female {<Number oldNum={0} newNum={femalePercentage} />}%</Text>

                </Flex>
            </Flex>
        </Box>
    );
};

export default Gender;
