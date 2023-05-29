var clientsArray = [];

function updateAllSheets() {
  processSheet_Paradise();
  processSheet_Import_Counts();
  processSheet_OCR_Invoice();
  processSheet_Breakthru_Scrape();
}

/**
 * MAIN method that runs on interval to create the Jobs Summary sheet and emails it.
 */
function updateJobsSummarySheet(e) {
  updateAllSheets();
  emailJobsSummary();
}

function processSheet_Paradise() {

  var jobType = JobType.Paradise;
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 8);

  jobFilter = {
    scheduleDate: {$gte: startDate},
    jobType: jobType,
    businessId: {$ne: "TEST-001"}
  };


  //Download Jobs from Database
  var jobs = database_GetDocuments(Collections.Sculpture_jobs, jobFilter);
  Logger.log('Total Jobs: ' + jobs.length);
  
  if(jobs.length === 0) return;

  //Remove Last 8 Days Jobs from Spreadsheet
  var sheet = SpreadsheetApp.openById(JobsSummarySheetId).getSheetByName(jobType);
  var sheetData = sheet.getDataRange().getValues();
  var index = 0;

  for(var i=0; i<sheetData.length; i++){
    if(sheetData[i][0] > startDate){
      index = i;
      break;
    }
  }

  if(index > 0){
    sheet.getRange(index + 1, 1 , sheetData.length-i, 9).clearContent();
    SpreadsheetApp.flush();
    Utilities.sleep(2);
    sheetData = sheet.getDataRange().getValues();
  }
  
  var jobsIds = [];
  var selectedJobs = [];

  for(var i=0; i<jobs.length; i++){
    if(sheetData.filter(value => value[6] === jobs[i]._id).length === 0){
      jobsIds.push(jobs[i]._id);
      selectedJobs.push(jobs[i]);
    }
  }
  Logger.log('Selected Jobs: ' + selectedJobs.length);

  if(selectedJobs.length === 0) return;

  jobs = selectedJobs;

  //Fetch Flow Status for the selected jobs
  var statusFilter = {
    jobId: {$in: jobsIds}
  };

  var flowsStatus = database_GetDocuments(Collections.Flow_status, statusFilter);
  
  //Insert Jobs into Sheet
  var data = [];
  var lastRow = sheet.getLastRow() + 1;
  var lastCol = sheet.getLastColumn();
  
  for(var i=0; i<jobs.length; i++){
    
    var job = jobs[i];

    if(jobsIds.filter(value => value === job._id).length === 0) continue;

    var businessId = job.businessId;
    var clientId = job.clientId;
    var client = getClient(businessId, clientId);

    var dataRow = [];
    dataRow.push(new Date(job.scheduleDate));

    if(client !== null){
      dataRow.push(client.businessName);
      dataRow.push(client.clientName);
    } else {
      dataRow.push("-");
      dataRow.push("-");
    }
    
    var process1 = flowsStatus.filter(value => 
    (value.jobId === job._id) && value.jobType === 'PROCESS_SALES_REPORTS');

    if(process1.length === 0) continue;
      
    var row = process1[0];
    var process1 = process1[0].status;
    var process2 = "";
    var process3 = "";

    if(row.itemRowCount != null && row.itemRowCount === 1){ //Having No Regular Sales Data
      process2 = "No Sales";
    } else {
      process2 = flowsStatus.filter(
        value => value.jobId === job._id && 
        value.jobType === JobType.Upload_Sales &&
        value.payload.dataType === 'REGULAR');
      
      process2 = process2.length > 0 ? process2[0].status : null;
    }

    if(row.modifiersRowCount != null && row.modifiersRowCount === 1){ //Having No Modifiers Data
      process3 = "No Sales";
    } else {
      process3 = flowsStatus.filter(
        value => value.jobId === job._id && 
        value.jobType === JobType.Upload_Sales &&
        value.payload.dataType === 'MODIFIERS');

      process3 = process3.length > 0 ? process3[0].status : null;
    }

    dataRow.push(process1);
    dataRow.push(process2);
    dataRow.push(process3);
    dataRow.push(job._id);
    dataRow.push(job.businessId);
    dataRow.push(job.clientId);

    Logger.log(dataRow);
    data.push(dataRow);

    // else if(jobType === JobType.Business_Summary){
    //   var process1 = flowsStatus.filter(value => 
    //   (value.jobId === job._id) && value.jobType === 'PROCESS_PURCHASES');

    //   if(process1.length === 0) continue;

    //   var process2 = flowsStatus.filter(value => 
    //   (value.jobId === job._id) && value.jobType === JobType.Business_Summary);

    //   dataRow.push(job.businessId);
    //   dataRow.push(job.clientId);

    //   dataRow.push(process1.length > 0 ? process1[0].status : null );
    //   dataRow.push(process2.length > 0 ? process2[0].status : null );
    //   dataRow.push(job._id);

    //   Logger.log(dataRow);
    //   data.push(dataRow);
    // }
    
  }

  if(data.length > 0){
    sheet.getRange(lastRow, 1, data.length, lastCol).setValues(data);
    sheet.sort(1)
    SpreadsheetApp.flush();
  }  
}

function processSheet_Import_Counts() {

  var jobType = JobType.Import_Counts;
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 8);

  var jobFilter = {
    insertDate: {$gte: startDate},
    jobType: jobType,
    "payload.businessId": {$ne: "TEST-001"}
  };

  //Download Jobs from Database
  var jobs = database_GetDocuments(Collections.Sculpture_jobs, jobFilter);
  Logger.log('Total Jobs: ' + jobs.length);

  
  if(jobs.length === 0) return;

  //Remove Last 8 Days Jobs from Spreadsheet
  var sheet = SpreadsheetApp.openById(JobsSummarySheetId).getSheetByName(jobType);
  var sheetData = sheet.getDataRange().getValues();
  var index = 0;

  for(var i=0; i<sheetData.length; i++){
    if(sheetData[i][0] > startDate){
      index = i;
      break;
    }
  }

  if(index > 0){
    sheet.getRange(index + 1, 1 , sheetData.length-i, 8).clearContent();
    SpreadsheetApp.flush();
    Utilities.sleep(2);
    sheetData = sheet.getDataRange().getValues();
  }

  var jobsIds = [];
  var selectedJobs = [];

  for(var i=0; i<jobs.length; i++){
    if(sheetData.filter(value => value[6] === jobs[i]._id).length === 0){
      jobsIds.push(jobs[i]._id);
      selectedJobs.push(jobs[i]);
    }
  }
  Logger.log('Selected Jobs: ' + selectedJobs.length);

  if(selectedJobs.length === 0) return;

  jobs = selectedJobs;

  //Fetch Flow Status for the selected jobs
  var flowsStatus = database_GetDocuments(Collections.Flow_status, {jobId: {$in: jobsIds}});

  //Insert Jobs into Sheet
  var data = [];
  var lastRow = sheet.getLastRow() + 1;
  var lastCol = sheet.getLastColumn();
  
  for(var i=0; i<jobs.length; i++){
    
    var job = jobs[i];

    if(jobsIds.filter(value => value === job._id).length === 0) continue;

    var businessId = job.payload.businessId;
    var clientId = job.payload.clientId;
    var client = getClient(businessId, clientId);

    var dataRow = [];
    dataRow.push(new Date(job.insertDate));

    if(client !== null){
      dataRow.push(client.businessName);
      dataRow.push(client.clientName);
    } else {
      dataRow.push("-");
      dataRow.push("-");
    }

    //Step 1 -> Email Received
    if(job.step_email_received === undefined){
      dataRow.push(null);
    } else {
      dataRow.push(job.step_email_received.status);
    }

    //Step 2 -> Upload Count
    var uploadCount = flowsStatus.filter(value => 
      (value.jobId === job._id) && value.jobType === 'IMPORT_COUNT');

    if(uploadCount.length === 0){
      dataRow.push(null);
    } else {
     dataRow.push(uploadCount[0].status);
    }

    dataRow.push(job._id);
    dataRow.push(job.payload.businessId);
    dataRow.push(job.payload.clientId);
    
    Logger.log(dataRow);
    
    if(dataRow[3] !== 'TEST'){
      data.push(dataRow);
    }
  }

  if(data.length > 0){
    sheet.getRange(lastRow, 1, data.length, lastCol).setValues(data);
    sheet.sort(1)
    SpreadsheetApp.flush();
  }  
}

function processSheet_OCR_Invoice() {

  var jobType = JobType.Ocr_Invoice;
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 10);

  var jobFilter = {
    insertDate: {$gte: startDate},
    jobType: jobType,
    "payload.businessId": {$ne: "TEST-001"}
  };

  //Download Jobs from Database
  var jobs = database_GetDocuments(Collections.Sculpture_jobs, jobFilter);
  Logger.log('Total Jobs: ' + jobs.length);
  
  if(jobs.length === 0) return;

  //Remove Last 5 Days Jobs from Spreadsheet
  var sheet = SpreadsheetApp.openById(JobsSummarySheetId).getSheetByName(jobType);
  var sheetData = sheet.getDataRange().getValues();  
  var index = 0;

  for(var i=0; i<sheetData.length; i++){
    if(sheetData[i][0] > startDate){
      index = i;
      break;
    }
  }

  if(index > 0){
    sheet.getRange(index + 1, 1 , sheetData.length-i, 12).clearContent();
    SpreadsheetApp.flush();
    Utilities.sleep(2);
    sheetData = sheet.getDataRange().getValues();
  }

  var jobsIds = [];
  var selectedJobs = [];

  for(var i=0; i<jobs.length; i++){
    if(sheetData.filter(value => value[6] === jobs[i]._id).length === 0){
      jobsIds.push(jobs[i]._id);
      selectedJobs.push(jobs[i]);
    }
  }
  Logger.log('Selected Jobs: ' + selectedJobs.length);

  if(selectedJobs.length === 0) return;

  jobs = selectedJobs;

  //Fetch Flow Status for the selected jobs
  var statusFilter = {
    jobId: {$in: jobsIds}
  };

  var flowsStatus = database_GetDocuments(Collections.Flow_status, statusFilter);

  //Insert Jobs into Sheet
  var data = [];
  var lastRow = sheet.getLastRow() + 1;
  var lastCol = sheet.getLastColumn();
  
  for(var i=0; i<jobs.length; i++){
    
    var job = jobs[i];
    if(jobsIds.filter(value => value === job._id).length === 0 || job.status === 'TEST') continue;

    var businessId = job.payload.businessId;
    var clientId = job.payload.clientId;
    var client = getClient(businessId, clientId);

    var dataRow = [];
    dataRow.push(new Date(job.insertDate));

    if(client !== null){
      dataRow.push(client.businessName);
      dataRow.push(client.clientName);
    } else {
      dataRow.push("-");
      dataRow.push("-");
    }
    
    dataRow.push(job.transformation_rule);

    var isIgnore = false;

    //Step 1 -> Email Received
    if(job.step_email_received === undefined){
      dataRow.push(null);
    } else {
      dataRow.push(job.step_email_received.status);
    }

    //Step 2 -> Process Invoice
    if(job.step_process_invoice === undefined){
      dataRow.push(null);
    } else {
      dataRow.push(job.step_process_invoice.status);
      isIgnore = job.step_process_invoice.status === "IGNORE";
    }

    //Step 3 -> Map Account & Client Ids
    if(isIgnore){
      dataRow.push("IGNORE");
    } else if(job.step_map_id === undefined || job.step_map_id === null){
      dataRow.push(null);
    } else {
      dataRow.push(job.step_map_id.status);
    }

    //Step 4 -> Upload Invoice
    var uploadInvoice = flowsStatus.filter(value => 
      (value.jobId === job._id) && value.jobType === 'UPLOAD_INVOICE');

    if(isIgnore){
      dataRow.push("IGNORE");
    } else if(uploadInvoice.length === 0){
      dataRow.push(null);
    } else {
     dataRow.push(uploadInvoice[0].status);
    }

    dataRow.push(job._id);
    dataRow.push(job.payload.businessId);
    dataRow.push(job.payload.clientId);
    dataRow.push(job.payload.accountId);

    Logger.log(dataRow);
    
    if(dataRow[3] !== 'TEST'){
      data.push(dataRow);
    }
  }

  if(data.length > 0){
    sheet.getRange(lastRow, 1, data.length, lastCol).setValues(data);
    sheet.sort(1)
    SpreadsheetApp.flush();
  }  
}

function processSheet_Breakthru_Scrape() {

  var jobType = JobType.Breakthru_Scrape_URLs;
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 8);

  var jobFilter = {
    runAt: {$gte: startDate},
    jobType: jobType
  };

  //Download Jobs from Database
  var jobs = database_GetDocuments(Collections.Flow_status, jobFilter);
  Logger.log('Total Jobs: ' + jobs.length);

  if(jobs.length === 0) return;

  //Remove Last 8 Days Jobs from Spreadsheet
  var sheet = SpreadsheetApp.openById(JobsSummarySheetId).getSheetByName(jobType);
  var sheetData = sheet.getDataRange().getValues();
  var index = 0;

  for(var i=1; i<sheetData.length; i++){
    if(sheetData[i][0] > startDate){
      index = i;
      break;
    }
  }

  if(index > 0){
    sheet.getRange(index + 1, 1 , sheetData.length-i, 8).clearContent();
    SpreadsheetApp.flush();
    Utilities.sleep(2);
    sheetData = sheet.getDataRange().getValues();
  }

  //Insert Jobs into Sheet
  var data = [];
  var lastRow = sheet.getLastRow() + 1;
  var lastCol = sheet.getLastColumn();

  for(var i=0; i<jobs.length; i++){
    var job = jobs[i];

    data.push(
      [new Date(job.runAt),
      job.status]
    );
  }

  if(data.length > 0){
    sheet.getRange(lastRow, 1, data.length, lastCol).setValues(data);
    sheet.sort(1)
    SpreadsheetApp.flush();
  }  
}

function getClient(businessId, clientId){

  if(businessId === undefined || clientId === undefined) return null;

  var client = clientsArray.filter(value => (value.businessId === businessId) 
    && (value.clientId === clientId));

  if(client.length === 0){
    
    //Fetch Client Details if not found in Array
    client = database_GetClientDetails(businessId, clientId);
    
    if(client.length > 0){
      client = client[0];
      clientsArray.push(
        {
          businessId: businessId,
          clientId : clientId,
          businessName: client.businessName,
          clientName: client.clientName
        }
      );
    }
  } else {
    client = client[0];
  }
  return client;
}












