/*
Author: Brayden Campbell
Date: 2023-08-03
*/

//getAllCalls is used to retrieve all of the calls from the backend and return them to the front end as a json object
export const getAllCalls = async () => {
    let response = await fetch('https://cerulean-marlin-wig.cyclic.app/activities');
    let json = await response.json();
    return json;
}

//archiveCall takes in a list of calls, filters them to ensure that an archived call did not get through causing additional strain,
//and then it patches the is_archived value to true.
//it then returns getallcalls to update the page without needing to reload
export const archiveCall = async (archivedCallList) => {

    const callIdsToArchive = archivedCallList
        .filter((call) => call.is_archived === false)
        .map((call) => call.id);    

    if (callIdsToArchive.length > 0) {
        await Promise.all(callIdsToArchive.map(async (call) => {
            let response = await fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${call}`, {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({ is_archived: true }),
            });
        }));
    }

    const updatedData = await getAllCalls();

    return updatedData;
};

//unarchiveCall takes in a list of calls, filters them to ensure that a non-archived call did not get through causing additional strain,
//and then it patches the is_archived value to false
//it then returns getallcalls to update the page without needing to reload
export const unarchiveCall = async (unarchiveList) => {

    const callIdsToUnarchive = unarchiveList
        .filter((call) => call.is_archived === true)
        .map((call) => call.id);    

    if (callIdsToUnarchive.length > 0) {
        await Promise.all(callIdsToUnarchive.map(async (call) => {
            let response = await fetch(`https://cerulean-marlin-wig.cyclic.app/activities/${call}`, {
                method: "PATCH",
                headers: {
                            "Content-Type": "application/json; charset=utf-8",
                        },
                body: JSON.stringify({is_archived: false})
            });
        }));
    }
    const updatedData = await getAllCalls();

    return updatedData;
}

//unarchiveAllCalls runs the reset call to set all calls base to unarchived.
//it then returns getallcalls to update the page without needing to reload
export const unarchiveAllCalls = async () => {
    let response = await fetch ('https://cerulean-marlin-wig.cyclic.app/reset', {
        method: "PATCH"
    });

    const updatedData = await getAllCalls();

    return updatedData;
}
