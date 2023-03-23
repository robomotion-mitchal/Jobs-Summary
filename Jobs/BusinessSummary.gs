function businessSummary_makeRequest(job) {
  
  var data = {
    "jobId": job._id,
    "businessId": job.businessId,
    "clientId": job.clientId,
    "scheduleDate": job.scheduleDate
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };

  var response = UrlFetchApp.fetch(SculptureConfig.ServerURL + 'sculpture/processPurchases', options);
  Logger.log(response.getContentText());
  return response.getResponseCode();
}
