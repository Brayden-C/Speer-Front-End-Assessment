import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {ArrowBack} from '@mui/icons-material';

import {getAllCalls, archiveCall} from './APIHelpers.js';

import { useCallData } from './CallDataContext';

function Inbox() {
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

  const uniqueItemsWithDates = new Set();
  const callCounts = {};

  if(data !== undefined){
    sortedData.forEach(tempItem => {
      if (tempItem.to !== null && tempItem.from !== undefined && tempItem.direction !== 'outbound' && !tempItem.is_archived) {
        let date = new Date(tempItem.created_at);
        let formattedDate = `${date.toLocaleString('default', {
          month: 'long',
        })}, ${date.getDate()} ${date.getFullYear()}`;
        const tempItemWithDateKey = `${tempItem.to}-${formattedDate}`;

        callCounts[tempItemWithDateKey] = (callCounts[tempItemWithDateKey] || 0) + 1;
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

  const onArchiveAllClick = async () => {
    data.map(call =>{
      if(call.direction === 'inbound' && call.to !== undefined && call.from !== undefined){
        archivedCalls.push(call);
      }
    })

    const updatedData = await archiveCall(archivedCalls);
    setData(updatedData);
  }

  const onArchiveClick = async () =>{
    data.map(call =>{
      if(call.to === selectedItem.to && call.from !== undefined && call.direction !== 'outbound'){
        archivedCalls.push(call);
      }
    })

    const updatedData = await archiveCall(archivedCalls);
    setData(updatedData);
    setSelectedItem(null);
  }


  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <Card onClick={onArchiveAllClick} style={{ backgroundColor: 'white', marginBottom: '8px', cursor: 'pointer', height: '40px', border: '2px solid #ccc' }}>
        <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: "5px" }}>
          <Typography variant="h6">Archive All</Typography>
        </CardContent>
      </Card>

      {sortedData.map(item => {
        if (item.to !== undefined && item.from !== undefined && item.direction ==='inbound' && !item.is_archived) {
          let date = new Date(item.created_at);
          let formattedDate = `${date.toLocaleString('default', {
            month: 'long',
          })}, ${date.getDate()} ${date.getFullYear()}`;

          let shouldRenderDate = prevDate !== formattedDate;
          prevDate = formattedDate;

          const itemWithDateKey = `${item.to}-${formattedDate}`;

          if (!uniqueItemsWithDates.has(itemWithDateKey)) {
            uniqueItemsWithDates.add(itemWithDateKey);

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
                    {callCounts[itemWithDateKey] > 1 && (
                      <div style={{ backgroundColor: 'red', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
                        {callCounts[itemWithDateKey]}
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
          <Button variant="contained" onClick={onArchiveClick} color="primary">Archive Call</Button>
          <Button variant="contained" onClick={handleClosePopup} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Inbox;
