import { HStack, Box, Text } from '@chakra-ui/react';
import React from 'react';
import PieChart from '../PieChart/PieChart';
// import './Dashboard.css'; // Assuming you will use an external CSS for styling

const Stats = ({ value }) => {
    return (
        <Box boxShadow="base" h="100%">
            <Text>Per Billion People</Text>
            <Text>{value}</Text>
        </Box>


        // <div className="dashboard-container">
        //     <div className="percentage-container male-percentage">
        //         <h1>{malePercentage}%</h1>
        //         <p>Male</p>
        //     </div>
        //     <div className="pie-chart-container">
        //         <PieChart data={pieChartData} />
        //     </div>
        //     <div className="percentage-container female-percentage">
        //         <h1>{femalePercentage}%</h1>
        //         <p>Female</p>
        //     </div>
        // </div>
    );
};

export default Stats;
