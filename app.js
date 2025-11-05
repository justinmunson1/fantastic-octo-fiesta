document.addEventListener("DOMContentLoaded", () => {
    
    // --- Configuration ---
    // Your list of 10 activities
    const activities = [
        "Pre-Trip Inspection",
        "At Stop: Loading",
        "At Stop: Unloading",
        "At Stop: Paperwork",
        "On Break: Meal",
        "On Break: Personal",
        "Fueling Vehicle",
        "Vehicle Maintenance",
        "Delayed: Weather",
        "Delayed: Traffic"
    ];
    
    // --- HTML Element References ---
    const activityList = document.getElementById("activity-list");
    const submitButton = document.getElementById("submit-button");
    const errorMessage = document.getElementById("error-message");
    
    let selectedActivity = null;

    // --- Initialization ---
    
    // 1. Populate the activity list
    activities.forEach(activity => {
        const li = document.createElement("li");
        li.textContent = activity;
        li.dataset.activity = activity;
        activityList.appendChild(li);
    });

    // --- Event Listeners ---

    // 2. Handle clicking on an activity
    activityList.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            // Clear previous selection
            const currentSelected = activityList.querySelector(".selected");
            if (currentSelected) {
                currentSelected.classList.remove("selected");
            }
            
            // Highlight new selection
            e.target.classList.add("selected");
            selectedActivity = e.target.dataset.activity;
            
            // Hide error message if it was visible
            errorMessage.classList.add("error-hidden");
        }
    });

    // 3. Handle the submit button click
    submitButton.addEventListener("click", () => {
        if (selectedActivity) {
            // An activity is selected, proceed to submit
            console.log("Submitting:", selectedActivity);
            
            // Hide error
            errorMessage.classList.add("error-hidden");
            
            //
            // --- !!! GEOTAB API CALL GOES HERE !!! ---
            //
            // This is where you send the data to MyGeotab.
            // You would typically use 'addLogRecord' to store this as a
            // custom log on the vehicle's record.
            
            // 1. Initialize the API
            geotab.drive.api.call(
                "Get",
                {
                    typeName: "Device",
                    search: {
                        // 'device.id' is a special token that gets the
                        // ID of the vehicle this add-in is running on.
                        id: "device.id" 
                    }
                },
                (result) => {
                    // We have the device ID from result[0].id
                    const deviceId = result[0].id;
                    
                    // 2. Create the log record
                    const logRecord = {
                        device: { id: deviceId },
                        logType: "DriverActivity", // A custom log type
                        message: `Driver selected activity: ${selectedActivity}`
                    };
                    
                    // 3. Send the log record to MyGeotab
                    geotab.drive.api.call(
                        "Add",
                        {
                            typeName: "LogRecord",
                            entity: logRecord
                        },
                        (addResult) => {
                            console.log("LogRecord added successfully:", addResult);
                            
                            // Optional: Close the add-in after successful submission
                            // geotab.drive.leaveAddIn(); 
                            
                            // Or, show a success message
                            alert("Activity submitted!");
                            
                            // Clear selection
                            const currentSelected = activityList.querySelector(".selected");
                            if (currentSelected) {
                                currentSelected.classList.remove("selected");
                            }
                            selectedActivity = null;

                        },
                        (error) => {
                            console.error("Error adding LogRecord:", error);
                            errorMessage.textContent = "Submission failed. Please try again.";
                            errorMessage.classList.remove("error-hidden");
                        }
                    );
                },
                (error) => {
                    console.error("Error getting Device:", error);
                    errorMessage.textContent = "Could not get device info. Check connection.";
                    errorMessage.classList.remove("error-hidden");
                }
            );

        } else {
            // No activity selected, show an error
            errorMessage.textContent = "Please select an activity.";
            errorMessage.classList.remove("error-hidden");
        }
    });

    // --- GeoTab Add-In Initialization ---
    // This 'geotab.drive.ready' function is called by the GeoTab
    // environment to let you know the API is ready to be used.
    
    if (typeof geotab !== 'undefined' && typeof geotab.drive !== 'undefined') {
        geotab.drive.ready(() => {
            console.log("GeoTab Drive API is ready.");
            // You can add any "on load" logic here, like
            // fetching the driver's name or vehicle info.
        });
    } else {
        console.warn("GeoTab API not found. Running in browser mode.");
        // This is useful for testing in a regular web browser
        // without the GeoTab Drive app.
    }
});