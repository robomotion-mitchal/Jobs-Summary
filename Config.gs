const JobsSummarySheetId = "12EfvHDJgff-n1v8iMgY8C6ilO2V_nUqHZIFlZWRdD7k";

const Summary_Recipients = 'arif134@gmail.com,m.majors@sculpturehospitality.com,gopal.sabhadiya@gmail.com';
// const Summary_Recipients = 'arif134@gmail.com';

//RM API Token:
//fb73e14e446046e6b86b1c6bb27e99f7efc0542980d94fac9487b2adab92f3e3

var DbConfig = {
  APIKey: "eGrWm6iCrEOgkhtJmy7BDtGW9pTiv15vCxBiZ82tKaqBeLvIGJP3C1zk9GQ0C07i",
  DataSource:"robomotion",
  Database:"automation",
  InsertURL: "https://data.mongodb-api.com/app/data-eadmf/endpoint/data/v1/action/insertOne",
  UpdateURL: "https://data.mongodb-api.com/app/data-eadmf/endpoint/data/v1/action/updateOne",
  FindURL: "https://data.mongodb-api.com/app/data-eadmf/endpoint/data/v1/action/find",
  AggregateURL: "https://data.mongodb-api.com/app/data-eadmf/endpoint/data/v1/action/aggregate"
};

var Collections = {
  Sculpture: "sculpture",
  Sculpture_jobs: "sculpture_jobs",
  Flow_status: "flow_status"
};

var JobStatus = {
  Scheduled: "SCHEDULED",
  Success: "SUCCESS"
};

var JobType = {
  Paradise: "paradise",
  Import_Counts: "import_counts",
  Business_Summary: "business_summary",
  Ocr_Invoice: "ocr_invoice",
  Upload_Sales: "UPLOAD_SALES"
};

var SculptureConfig = {
  ServerURL: "http://143.198.114.144:4000/"
};
