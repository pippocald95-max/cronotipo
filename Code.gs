const SPREADSHEET_ID = '1I91_lMEMCeaHOh9lKXjm_9IZvN07acMjSk0KMkw-pSA';
const SHEET_NAME = 'Sheet1';

function doGet(e) {
  const clientId = e.parameter.clientId;
  const token = e.parameter.token;
  
  if (clientId && token) {
    const clientData = getClientDashboard(clientId, token);
    if (clientData) {
      const template = HtmlService.createTemplateFromFile('Dashboard');
      template.data = clientData;
      return template.evaluate()
        .setTitle('Cronotipo - Dashboard Personale')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else {
      return HtmlService.createHtmlOutput('<h1>Accesso negato o sessione scaduta</h1><p>Verifica il tuo link personale.</p>');
    }
  }
  
  return HtmlService.createTemplateFromFile('form')
    .evaluate()
    .setTitle('Scopri il tuo Cronotipo - Premium Questionnaire')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function submitForm(formData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const clientId = Utilities.getUuid();
    const token = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, clientId + Math.random())).substring(0, 16);
    
    const results = calculateChronotype(formData);
    
    const rowData = [
      new Date(),
      clientId,
      token,
      formData.name,
      formData.email,
      formData.sex,
      formData.age,
      formData.jobType,
      formData.stressLevel,
      formData.shiftWorker,
      formData.sleepWorkBedtime,
      formData.sleepWorkLightsOff,
      formData.sleepWorkLatency,
      formData.sleepWorkWakeTime,
      formData.sleepWorkGetUpTime,
      formData.sleepFreeBedtime,
      formData.sleepFreeLightsOff,
      formData.sleepFreeLatency,
      formData.sleepFreeWakeTime,
      formData.sleepFreeGetUpTime,
      formData.subjectiveChronotype,
      formData.sleepQuality,
      formData.caffeine,
      formData.exercise,
      formData.notes,
      results.msw,
      results.msf,
      results.socialJetlag,
      results.category,
      results.score,
      JSON.stringify(results.recommendations),
      '' // dashboardUrl placeholder
    ];
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    const scriptUrl = ScriptApp.getService().getUrl();
    const dashboardUrl = scriptUrl + '?clientId=' + clientId + '&token=' + token;
    sheet.getRange(lastRow, 32).setValue(dashboardUrl);
    
    return {
      success: true,
      dashboardUrl: dashboardUrl
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function calculateChronotype(d) {
  const toMin = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const getMidpoint = (bed, wake) => {
    let b = toMin(bed);
    let w = toMin(wake);
    if (w < b) w += 1440; // overnight
    return (b + w) / 2 % 1440;
  };

  const msw = getMidpoint(d.sleepWorkLightsOff, d.sleepWorkWakeTime);
  const msf = getMidpoint(d.sleepFreeLightsOff, d.sleepFreeWakeTime);
  
  let sjl = (msf - msw);
  if (sjl > 720) sjl -= 1440;
  if (sjl < -720) sjl += 1440;
  sjl = Math.abs(sjl) / 60;

  let category = 'Intermedio';
  const msfH = msf / 60;
  if (msfH < 3.5) category = 'Mattutino';
  else if (msfH > 5.5) category = 'Serotino';

  const recs = generateRecommendations(category, d);

  return {
    msw: (msw/60).toFixed(2),
    msf: (msfH).toFixed(2),
    socialJetlag: sjl.toFixed(2),
    category: category,
    score: (msfH).toFixed(2),
    recommendations: recs
  };
}

function generateRecommendations(cat, d) {
  const recs = [];
  if (cat === 'Serotino') {
    recs.push('Evita luci blu dopo le 22:00 per favorire la melatonina.');
    recs.push('Cerca di esporti alla luce solare appena sveglio.');
  } else if (cat === 'Mattutino') {Created Code.gs for Google Apps Script backend
    recs.push('Sfrutta le prime ore del mattino per i task più complessi.');
    recs.push('Pianifica attività sociali nel tardo pomeriggio per non cedere alla stanchezza serale.');
  }
  
  if (parseInt(d.stressLevel) > 7) {
    recs.push('Pratica 10 minuti di meditazione prima di coricarti per abbassare il cortisolo.');
  }
  
  if (d.caffeine === 'Sì, molto') {
    recs.push('Limita la caffeina dopo le ore 14:00.');
  }
  
  return recs;
}

function getClientDashboard(clientId, token) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === clientId && data[i][2] === token) {
      return {
        name: data[i][3],
        category: data[i][28],
        sjl: data[i][27],
        msf: data[i][26],
        recommendations: JSON.parse(data[i][30] || '[]'),
        quality: data[i][21]
      };
    }
  }
  return null;
}
