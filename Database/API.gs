function database_GetDocuments(collectionName, filter) {

  var headers = {
    "api-key": DbConfig.APIKey,
  };

  var data = {
    "dataSource": DbConfig.DataSource,
    "database": DbConfig.Database,
    "collection":collectionName,
    "filter": filter
  };

  var options = {
    'headers': headers,
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };

  var response = UrlFetchApp.fetch(DbConfig.FindURL, options);

  if(response.getResponseCode() === 200){
    return JSON.parse(response.getContentText()).documents;
  }

  return {};
}

function database_UpdateDocument(collectionName, filter, update) {

  var headers = {
    "api-key": DbConfig.APIKey,
  };

  var data = {
    "dataSource": DbConfig.DataSource,
    "database": DbConfig.Database,
    "collection": collectionName,
    "filter": filter,
    "update": { "$set": update }
  };

  var options = {
    'headers': headers,
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(DbConfig.UpdateURL, options);

  Logger.log(response.getContentText());
  return response;
}

function database_InsertDocument(collectionName, document) {

  var headers = {
    "api-key": DbConfig.APIKey,
  };

  var data = {
    "dataSource": DbConfig.DataSource,
    "database": DbConfig.Database,
    "collection": collectionName,
    "document": document
  };

  var options = {
    'headers': headers,
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(DbConfig.InsertURL, options);

  Logger.log(response.getContentText());
  return response;
}

function database_GetClientDetails(businessId, clientId) {

  var headers = {
    "api-key": DbConfig.APIKey,
  };

  var data = {
    "dataSource": DbConfig.DataSource,
    "database": DbConfig.Database,
    "collection": "sculpture",
    "pipeline": [
      {
        "$match": {
          "businessId": businessId,
          "clientId" : clientId
        }
      },
      {
        "$lookup": {
          "from": "sculpture_business",
          "localField": "businessId",
          "foreignField": "businessId",
          "as": "business"
        }
      }
    ]
  };

  var options = {
    'headers': headers,
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch(DbConfig.AggregateURL, options);
  return JSON.parse(response).documents;
  
}
















