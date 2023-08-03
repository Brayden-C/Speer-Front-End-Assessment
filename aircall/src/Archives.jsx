import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import Header from './Header.jsx';
import {getAllCalls, unarchiveCall, unarchiveAllCalls} from './APIHelpers.js';

import { ArrowForward, ArrowBack } from '@mui/icons-material';

import { useCallData } from './CallDataContext';

function Archives() {
  const {data, setData} = useCallData();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    getAllCalls()
      .then(response => setData(response))
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, []);

  let sortedData = []
  // Sort the data by call time in descending order (most recent first)
  if(data !== undefined){
    sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }


  let prevDate = null;

  const uniqueItemsWithDatesInbound = new Set();
  const uniqueItemsWithDatesOutbound = new Set();
  const inboundCallCounts = {};
  const outboundCallCounts = {};

  if(data !== undefined){
    sortedData.forEach(tempItem => {
      if (tempItem.to !== undefined && tempItem.from !== undefined && tempItem.is_archived) {
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


  let unarchivedCalls = []

  const onUnarchiveAllClick = async () => {
    const updatedData = await unarchiveAllCalls();
    setData(updatedData);
  }

  const onUnarchiveClick = async () =>{
    data.map(call =>{
      if(call.to !== undefined && call.to === selectedItem.to && call.direction == selectedItem.direction){
        unarchivedCalls.push(call);
      }
    })

    const updatedData = await unarchiveCall(unarchivedCalls);
    setData(updatedData);
    setSelectedItem(null);
  }


  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <Card onClick={onUnarchiveAllClick} style={{ backgroundColor: 'white', marginBottom: '8px', cursor: 'pointer', height: '40px', border: '2px solid #ccc' }}>
        <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: "5px" }}>
          <Typography variant="h6">Unarchive All</Typography>
        </CardContent>
      </Card>
      {sortedData.map(item => {
        if (item.to !== undefined && item.from !== undefined && item.is_archived && item.direction === "inbound") {
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
        } else if (item.to !== undefined && item.from !== undefined && item.is_archived && item.direction === "outbound") {
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
        return null;
      })}
      {/* Popup Component */}
      <Dialog open={Boolean(selectedItem)} onClose={handleClosePopup}>
        <DialogContent style={{ minWidth: '300px', textAlign: 'center' }}>
          {/* Display all information for the selected item */}
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
          <Button variant="contained" onClick={onUnarchiveClick} color="primary">Unarchive Call</Button>
          <Button variant="contained" onClick={handleClosePopup} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Archives;
