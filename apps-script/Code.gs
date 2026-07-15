/**
 * Recibe los envíos del formulario de reserva (index.html) y agrega una
 * fila por cada uno en la hoja de cálculo a la que este script está
 * vinculado.
 *
 * INSTALACIÓN
 * 1. Abrí la hoja de cálculo de Google Sheets donde querés registrar las
 *    reservas.
 * 2. Extensiones > Apps Script.
 * 3. Borrá el contenido de Code.gs y pegá este archivo completo.
 * 4. Guardá el proyecto (podés llamarlo "Armonic - Reservas").
 * 5. Implementar > Nueva implementación > selecciona el ícono de
 *    engranaje > "Aplicación web".
 *    - Descripción: la que quieras.
 *    - Ejecutar como: Yo (tu cuenta).
 *    - Quién tiene acceso: Cualquier usuario.
 * 6. Autorizá los permisos que pida Google (es tu propio script).
 * 7. Copiá la URL de "Aplicación web" que te da al final (termina en
 *    /exec) y pegala como valor de GOOGLE_SHEETS_ENDPOINT en
 *    js/main.js.
 *
 * Cada vez que vuelvas a editar este script, tenés que hacer
 * Implementar > Gestionar implementaciones > editar (lápiz) > Nueva
 * versión > Implementar, para que los cambios se apliquen a la URL ya
 * publicada.
 */

var SHEET_NAME = 'Reservas';
var HEADERS = ['Fecha y hora', 'Nombre y apellido', 'Teléfono / WhatsApp', 'Estado'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();

    var timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'dd/MM/yyyy HH:mm:ss'
    );

    sheet.appendRow([
      timestamp,
      data.nombre || '',
      data.telefono || '',
      'Pendiente'
    ]);

    return jsonResponse_({ result: 'success' });
  } catch (error) {
    return jsonResponse_({ result: 'error', message: String(error) });
  }
}

function getOrCreateSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
