// 1. Fetch Clients from Paradise Database
// 2. Schedule daily jobs
function sculpture_ScheduleJobs(e) {

  Logger.log(e);
  
  var clients = database_GetDocuments(Collections.Sculpture, {});

  for(var i=0;i< clients.length; i++){

    var client = clients[i];
    var runAt = null, jobType = null;

    if(client.paradise !== undefined){
      runAt = client.paradise.schedule.business_closeTime.replace('T','').replace('.000Z','');
      jobType = JobType.Paradise;
    } else if(client.business_summary !== undefined){
      runAt = client.business_summary.schedule.runAt;
      jobType = JobType.Business_Summary;
    }

    if(runAt === null) continue;
    
    var scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 1);
    scheduleDate.setHours(Number(runAt.split(':')[0]) + 1, runAt.split(':')[1], 0, 0);
    
    var document = {
      "businessId": client.businessId,
      "clientId": client.clientId,
      "jobType": jobType,
      "insertDate": new Date().toISOString(),
      "scheduleDate": scheduleDate.toISOString(),
      "lastRunDate": "",
      "status": JobStatus.Scheduled
    };

    Logger.log(document);
    database_InsertDocument(Collections.Sculpture_jobs, document);  
  }
}

// Fetch all scheduled jobs, check their scheduled time and run.
function sculpture_ExecuteJobs(e) {
  
  Logger.log(e);
  
  var filter = {
    "status": JobStatus.Scheduled
  };

  var jobs = database_GetDocuments(Collections.Sculpture_jobs, filter);
  Logger.log('Scheduled Jobs Count: ' + jobs.length);
  
  for(var i=0;i < jobs.length; i++){
    
    var job = jobs[i];
    var today = new Date();
    var scheduleDate = new Date(job.scheduleDate);
    
    if(scheduleDate < today){
      
      var responseCode = null;
      Logger.log('Running Scheduled Job: ' + JSON.stringify(job));

      if(job.jobType === JobType.Paradise){
        responseCode = paradise_makeRequest(job);
      } else if(job.jobType === JobType.Business_Summary){
        responseCode = businessSummary_makeRequest(job);
      }
 
      if(responseCode === 200){
        var filter = {"_id": { "$oid": job._id }};
        var update = { 
          "status": JobStatus.Success,
          "lastRunDate": new Date().toISOString()
        };

        database_UpdateDocument(Collections.Sculpture_jobs, filter, update);
      }
    }
  }
}







