export const getAllCalls = async () => {
    let response = await fetch('https://cerulean-marlin-wig.cyclic.app/activities');
    let json = await response.json();
    return json;
}

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

export const unarchiveAllCalls = async () => {
    let response = await fetch ('https://cerulean-marlin-wig.cyclic.app/reset', {
        method: "PATCH"
    });

    const updatedData = await getAllCalls();

    return updatedData;
}
