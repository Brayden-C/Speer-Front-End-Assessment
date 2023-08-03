/*
Author: Brayden Campbell
Date: 2023-08-03
Purpose: AllCalls.jsx is used to house all of the calls that the user has made and recieved that are not archived.
The user is allowed to view the calls, click on a single call, unarchive a single call, and unarchive all calls. 
When the user clicks on a call, they are given all of the information regarding that call.
*/

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Dialog, DialogContent, DialogActions } from '@mui/material';

import {getAllCalls, archiveCall} from './APIHelpers.js';

import { useCallData } from './CallDataContext';

import { ArrowForward, ArrowBack } from '@mui/icons-material';

function AllCalls() {
  //by using useCallData instead of useState, we are able to access the callDataContext that is at the upper level of the program
  const {data, setData} = useCallData();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    getAllCalls()
      .then(response => setData(response))
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, []);

  // Sort the data by call time in descending order (most recent first)
  let sortedData = []
  if(data !== undefined){
    sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  let prevDate = null;

  const uniqueItemsWithDatesInbound = new Set();
  const uniqueItemsWithDatesOutbound = new Set();
  const inboundCallCounts = {};
  const outboundCallCounts = {};

  //this if-block is going through the sorted data, grabbing all of the calls that have not been archived and have proper data, and counting the number of times a certain number appears. 
  //It determines weather the call was inbound or outbound and sorts them accordingly
  //it then stores this data in callCounts to facilitate the output of only one call, with the number of times the number was called beside it
   if(data !== undefined){
    sortedData.forEach(tempItem => {
      if (tempItem.to !== undefined && tempItem.from !== undefined && !tempItem.is_archived) {
        let date = new Date(tempItem.created_at);
        let formattedDate = `${date.toLocaleString('default', {
          month: 'long',
        })}, ${date.getDate()} ${date.getFullYear()}`;
        const tempItemWithDateKey = `${tempItem.to}-${formattedDate}`;

        if(tempItem.direction !== "outbound"){
          inboundCallCounts[tempItemWithDateKey] = (inboundCallCounts[tempItemWithDateKey] || 0) + 1;
        }
        else{
          outboundCallCounts[tempItemWithDateKey] = (outboundCallCounts[tempItemWithDateKey] || 0) + 1;
        }
      }
    });
  }

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
  };

  let archivedCalls = []

  //onArchiveAllClick sorts through the data to ensure that all calls are being archived.
  //It then pushes those calls to an array to pass to the archiveCall function. 
  //Once the archiveCall function is complete, it takes the result and updates the global data variable with the result.
  const onArchiveAllClick = async () => {
    data.map(call =>{
      if(call.to !== undefined && call.from !== undefined){
        archivedCalls.push(call);
      }
    })

    const updatedData = await archiveCall(archivedCalls);
    setData(updatedData);
  }

  //onArchiveClick sorts through the data to ensure that all calls from the same number, on the same day, in the same direction are being archived, as they are stacked ontop of eachother.
  //It then pushes those calls to an array to pass to the archiveCall function. 
  //Once the archiveCall function is complete, it takes the result and updates the global data variable with the result.
   const onArchiveClick = async () =>{
    data.map(call =>{
      if(call.from !== undefined && call.to !== undefined && call.to === selectedItem.to && call.direction == selectedItem.direction){
        archivedCalls.push(call);
      }
    })
    const updatedData = await archiveCall(archivedCalls);
    setData(updatedData);
    setSelectedItem(null);
  }

  /*In the return, there are a few things happening.
  First: the archiveAll button is created at the top of the page. 
  Second: The data is mapped through to determine what should be displayed. 
          The first thing the map does is it checks to see if the call is inbound or outbound. The logic for both is the same, so i will be describing it in a general sense.
          It the checks to see if the date that the current call was made on is different from the previous. If it is, it prints out the new date. 
          Next, it checks to see if a particular number has already been rendered for that date in that direction. If it has not, it adds it to an array that keeps track of which calls have been displayed, and then renders it. 
          If it has rendered that number already, it skips over it. 
          It then creates a card to hold the call information. 
          The first ting the card shows is an arrow that shows weather the call was inbound or outbound, and coloured based on if the call was missed or accepted.
          Then, it renders the phone number.
          After that, it checks to see if the number of times that number called is greater than 1. If it is, it displays a red circle with the number of calls in it.
          Finally, it displays the time that the most recent call was made.
  Third: It creates a Dialog that is populated with the call information. This dialog is seen when the user clicks on a call, and shows them the call information and allows them to archive the call.
  
  */
  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <Card onClick={onArchiveAllClick} style={{ backgroundColor: 'white', marginBottom: '8px', cursor: 'pointer', height: '40px', border: '2px solid #ccc' }}>
        <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: "5px" }}>
          <Typography variant="h6">Archive All</Typography>
        </CardContent>
      </Card>
      {sortedData.map(item => {
        if (item.to !== undefined && item.from !== undefined && !item.is_archived && item.direction === "inbound") {
          let date = new Date(item.created_at);
          let formattedDate = `${date.toLocaleString('default', {
            month: 'long',
          })}, ${date.getDate()} ${date.getFullYear()}`;

          let shouldRenderDate = prevDate !== formattedDate;
          prevDate = formattedDate;

          const itemWithDateKey = `${item.to}-${formattedDate}`;

          if (!uniqueItemsWithDatesInbound.has(itemWithDateKey)) {
            uniqueItemsWithDatesInbound.add(itemWithDateKey);

            return (
              <div key={item.id}>
                {shouldRenderDate && <Typography variant="h5">{formattedDate}</Typography>}
                <Card onClick={() => handleCardClick(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '8px',  border:'2px solid #ccc' }}>
                  {item.call_type === 'missed' ? (
                    <ArrowBack sx={{ color: 'red', transform: 'rotate(-45deg)' }} />
                  ) : (
                    <ArrowBack sx={{ color: 'green', transform: 'rotate(-45deg)' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" style={{ marginRight: '8px' }}>{item.to}</Typography>
                    {inboundCallCounts[itemWithDateKey] > 1 && (
                      <div style={{ backgroundColor: 'red', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
                        {inboundCallCounts[itemWithDateKey]}
                      </div>
                    )}
                  </div>
                  <Typography variant="body2">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                </Card>
              </div>
            );
          }
        } else if (item.to !== undefined && item.from !== undefined && !item.is_archived && item.direction === "outbound") {
          let date = new Date(item.created_at);
          let formattedDate = `${date.toLocaleString('default', {
            month: 'long',
          })}, ${date.getDate()} ${date.getFullYear()}`;

          let shouldRenderDate = prevDate !== formattedDate;
          prevDate = formattedDate;

          const itemWithDateKey = `${item.to}-${formattedDate}`;

          if (!uniqueItemsWithDatesOutbound.has(itemWithDateKey)) {
            uniqueItemsWithDatesOutbound.add(itemWithDateKey);

            return (
              <div key={item.id}>
                {shouldRenderDate && <Typography variant="h5">{formattedDate}</Typography>}
                <Card onClick={() => handleCardClick(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '8px',  border:'2px solid #ccc' }}>
                  {item.call_type === 'missed' ? (
                    <ArrowForward sx={{ color: 'red', transform: 'rotate(-45deg)' }} />
                  ) : (
                    <ArrowForward sx={{ color: 'green', transform: 'rotate(-45deg)' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" style={{ marginRight: '8px' }}>{item.to}</Typography>
                    {outboundCallCounts[itemWithDateKey] > 1 && (
                      <div style={{ backgroundColor: 'red', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
                        {outboundCallCounts[itemWithDateKey]}
                      </div>
                    )}
                  </div>
                  <Typography variant="body2">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                </Card>
              </div>
            );
          }
        }
        else{}
        return null;
      })}
      <Dialog open={Boolean(selectedItem)} onClose={handleClosePopup}>
        <DialogContent style={{ minWidth: '300px', textAlign: 'center' }}>
          <Typography variant="body1">Direction: {selectedItem?.direction || 'N/A'}</Typography>
          <Typography variant="body1">From: {selectedItem?.from || 'N/A'}</Typography>
          <Typography variant="body1">To: {selectedItem?.to || 'N/A'}</Typography>
          <Typography variant="body1">Via: {selectedItem?.via || 'N/A'}</Typography>
          <Typography variant="body1">Duration: {selectedItem?.duration || 'N/A'}</Typography>
          <Typography variant="body1">Call Type: {selectedItem?.call_type || 'N/A'}</Typography>
          <Typography variant="body1">Is Archived: {selectedItem?.is_archived?.toString() || 'N/A'}</Typography>
          <Typography variant="body1">ID: {selectedItem?.id || 'N/A'}</Typography>
          <Typography variant="body1">Created At: {selectedItem?.created_at || 'N/A'}</Typography>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
          <Button variant="contained" onClick={onArchiveClick} color="primary">Archive Call</Button>
          <Button variant="contained" onClick={handleClosePopup} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AllCalls;
