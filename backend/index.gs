function doPost(e) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  try {
    // Parse the POST request data
    const postData = JSON.parse(e.postData.contents);
    const userId = e.parameter.userId;

    if (!userId) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "error",
          message: "userId parameter is required",
        })
      )
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    // Get the active spreadsheet and sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pointsSheet = ss.getSheetByName("Points") || ss.getActiveSheet();
    const backgroundSheet =
      ss.getSheetByName("Background") || ss.insertSheet("Background");

    // Get the points array and background info from the post data
    const { image, yearGuess, confidence, points, backgroundInfo } = postData;

    // Store background information if it exists and hasn't been stored yet
    if (backgroundInfo) {
      const backgroundRow = [
        new Date(), // Timestamp
        userId,
        backgroundInfo.age,
        backgroundInfo.gender,
        backgroundInfo.race,
        backgroundInfo.fashionKnowledge,
        backgroundInfo.aiExperience,
      ];
      backgroundSheet.appendRow(backgroundRow);
    }

    // Process each point and add it as a new row
    points.forEach((point) => {
      // Ensure comparison operator is treated as text by prefixing with a single quote
      const safeComparison = `'${point.comparison}`;

      const rowData = [
        new Date(), // Timestamp
        userId,
        image,
        yearGuess,
        confidence,
        point.x,
        point.y,
        point.year,
        safeComparison,
        point.comment,
      ];

      pointsSheet.appendRow(rowData);
    });

    // Return success response with CORS headers
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: `Successfully processed ${points.length} points`,
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    // Return error response with CORS headers
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Handle preflight OPTIONS requests
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

// Modify the setup function to create both sheets with appropriate headers
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Set up Points sheet
  const pointsSheet = ss.getSheetByName("Points") || ss.getActiveSheet();
  const pointsHeaders = [
    "Timestamp",
    "User ID",
    "Image",
    "Year Guess",
    "Confidence",
    "Point X",
    "Point Y",
    "Point Year",
    "Point Comparison",
    "Point Comment",
  ];
  pointsSheet
    .getRange(1, 1, 1, pointsHeaders.length)
    .setValues([pointsHeaders]);
  pointsSheet.setFrozenRows(1);

  // Set up Background sheet
  const backgroundSheet =
    ss.getSheetByName("Background") || ss.insertSheet("Background");
  const backgroundHeaders = [
    "Timestamp",
    "User ID",
    "Age",
    "Gender",
    "Race/Ethnicity",
    "Fashion Knowledge (1-5)",
    "AI Experience (1-5)",
  ];
  backgroundSheet
    .getRange(1, 1, 1, backgroundHeaders.length)
    .setValues([backgroundHeaders]);
  backgroundSheet.setFrozenRows(1);
}
