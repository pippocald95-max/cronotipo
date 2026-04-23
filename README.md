# Premium Chronotype Questionnaire & Dashboard

This project is a full-stack solution for collecting sleep data, calculating chronotypes (using MSF/Social Jetlag metrics), and providing personalized recommendations via a Google Apps Script Web App.

## Features
- **Multi-step form**: Professional UI with real-time validation.
- **Automated Calculations**: Calculates Sleep Midpoint (Work/Free days), Social Jetlag, and Chronotype Category.
- **Google Sheets Integration**: Stores all responses and calculated results in a spreadsheet.
- **Personalized Dashboard**: Users receive an immediate visual report after submission.

## Setup Instructions

### 1. Prepare the Google Sheet
- Create a new Google Sheet.
- In the first row, add the headers as defined in the `Code.gs` rowData structure.
- Copy the **Spreadsheet ID** from the URL.

### 2. Create the Apps Script Project
- Go to [script.google.com](https://script.google.com).
- Create a new project.
- Create the following files: `Code.gs`, `form.html`, `Dashboard.html`, `script.html`, `style.html`.

### 3. Configure
- In `Code.gs`, update `SPREADSHEET_ID` and `SHEET_NAME`.

### 4. Deploy
- Deploy as **Web App** (Execute as: Me, Access: Anyone).

## Technical Details
Uses MSF (Midpoint of Sleep on free days) corrected for sleep debt if applicable. Social Jetlag is calculated as the absolute difference between midpoint on work days and free days.
