function emailJobsSummary(){
  
  var html = createJobsSummaryEmail(JobType.Paradise);
  html += createJobsSummaryEmail(JobType.Import_Counts);
  html += createJobsSummaryEmail(JobType.Breakthru_Scrape_URLs);
  html += createJobsSummaryEmail(JobType.Ocr_Invoice);

  MailApp.sendEmail(
    {
      to: Summary_Recipients,
      subject: 'Sculpture Hospitality - Jobs Summary',
      htmlBody: html
    }
  );

  Logger.log('Email sent successfully!');
}

function createJobsSummaryEmail(jobType){
  
  var sheet = SpreadsheetApp.openById(JobsSummarySheetId).getSheetByName(jobType);
  var sheetData = sheet.getDataRange().getValues();

  var daysDiff = 1;

  var startDate = new Date();
  startDate.setDate(startDate.getDate() - daysDiff);

  var rows = sheetData.filter(value => (value[0] === 'Date' || value[0] >= startDate));
  
  var html = `<head><style>
  table {
	  border-collapse: collapse;
    font-family: Tahoma, Geneva, sans-serif;
  }
  table td {
    padding: 7px;
    text-align:center;
  }
  table thead td {
    background-color: #00A300;
    color: #ffffff;
    font-weight: bold;
    font-size: 13px;
    border: 1px solid #dddfe1;
  }
  table tbody td {
    color: #636363;
    border: 1px solid #dddfe1;
  }
  table tbody tr {
    background-color: #f9fafb;
  }
  table tbody tr:nth-child(odd) {
    background-color: #ffffff;
  }
  </style></head>`;

  var colDiff = 3;

  if(jobType === JobType.Paradise){
    html += '<h3>Paradise POS</h3><table>';
  } else if(jobType === JobType.Import_Counts){
    html += '<h3>Import Counts</h3><table>';    
  } else if(jobType === JobType.Breakthru_Scrape_URLs){
    html += '<h3>Breakthru Scrape Invoice URLs</h3><table>';
    colDiff = 0;
  } else if(jobType === JobType.Ocr_Invoice){
    html += '<h3>Invoices</h3><table>';
    colDiff = 4;
  } else if(jobType === JobType.Business_Summary){
    html += '<h3>Business Summary Report</h3><table>';
  }

  for(var i=0; i<rows.length; i++) {
    
    if(i == 0) html += "<thead>";

    html += "<tr>";

    for(var j=0; j < (rows[i].length-colDiff); j++){
      if(i > 0 && j == 0){
        var dt = new Date(rows[i][j]).toDateString().split(' ');
        html += "<td width='50px'>" + dt[2] + "-" + dt[1] + "</td>";
      } else{
        var cell = rows[i][j];
        
        cell = cell === "SUCCESS" ? "&#10004;" : cell;
        cell = cell === "FAILED" ? "&#10006;" : cell;
        html += "<td>" + cell + "</td>";
      }
    }
    
    html += "</tr>";
    if(i == 0) html += "</thead>";
  }
  html += "</table>";

  return html;
}






