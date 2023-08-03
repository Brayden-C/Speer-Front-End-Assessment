import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SwipeableViews from 'react-swipeable-views-react-18-fix/lib/SwipeableViews.js';

import Inbox from './Inbox.jsx';
import AllCalls from './AllCalls.jsx'
import Archives from './Archives.jsx';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabPanel() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSwipeChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          textColor="primary" // Add this line to change the text color of the tabs
          indicatorColor="primary" // Add this line to change the indicator (highlight) color of the selected tab
          centered // Add this line to center the tabs
        >
          <Tab label="Inbox" {...a11yProps(0)} />
          <Tab label="All Calls" {...a11yProps(1)} />
          <Tab label="Archive" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <SwipeableViews
        index={value}
        onChangeIndex={handleSwipeChangeIndex}
        enableMouseEvents // Enable mouse swipe as well
        resistance // Add resistance effect while swiping
      >
        <CustomTabPanel value={value} index={0}>
          {Inbox()}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {AllCalls()}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          {Archives()}
        </CustomTabPanel>
      </SwipeableViews>
    </Box>
  );
}
