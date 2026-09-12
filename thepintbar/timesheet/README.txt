THE PINT BAR — EMPLOYEE ROTA & TIMESHEET
=========================================

WHAT'S IN THIS FOLDER
---------------------
Timesheet.html               The whole application in one file. Fonts, styles,
                             the logo and the Excel engine are built in —
                             fully offline, nothing else needed to run it.
data/The-Pint-Bar-Rota.xlsx  Your live workbook, pre-filled with the demo staff
                             and three weeks of shifts.
assets/pintbar-lockup.svg    The Pint Bar lockup, kept as an editable source
                             copy. Timesheet.html already has it embedded, so
                             the app still works if this file is missing.
README.txt                   This file.

BRAND
-----
Cellar Green  #12332A   top bar, scheduled-hours bars, full-time share
Bitter Amber  #C8811E   mode selector, chart bars, role and flag chips, overtime
Black ink     #201E1D   all table and body text

KEEP THE FOLDER TOGETHER. Timesheet.html and the data folder belong side by side.

INSTALLING
----------
1. Copy this folder anywhere on your computer (Desktop, Documents, a USB
   stick, a shared drive folder — all fine).
2. Double-click Timesheet.html. It opens in your normal browser.
3. Optional: bookmark it, or right-click > "Open with" > pick your preferred
   browser. Chrome, Edge, Firefox and Safari all work.

No install, no account, no internet connection, no server.

SET IT UP ONCE — THEN THE EXCEL FILE IS YOUR DATABASE
-----------------------------------------------------
Use Chrome or Microsoft Edge for this (see "Other browsers" below).

 1. Open Timesheet.html.
 2. Click "Link Excel file" (top right).
 3. In the file picker, go into the data folder and choose
    The-Pint-Bar-Rota.xlsx. Allow "Edit file" when the browser asks.

That's it. From then on:
 - The demo employees and shifts load straight out of the workbook.
 - Every add, edit or delete you make is written back into that same .xlsx
   within a second — the status line at the top shows "saved 14:32:05".
 - The link is remembered. Next time you open Timesheet.html it reads the
   workbook again, so whatever you last saved is what you see.
 - After a browser restart the button may say "Reconnect Excel file" — one
   click, because browsers re-ask permission for file access.

The spreadsheet is the source of truth. You can open it in Excel, change hours
or add staff on the Employees and Rota sheets, save, close Excel, reload
Timesheet.html — your edits appear in the dashboard.

Important: close the workbook in Excel while you are working in the browser.
Excel locks the file and the browser cannot write to a locked file.

Other browsers (Firefox, Safari)
Direct file linking is a Chrome/Edge capability. In Firefox and Safari the app
keeps your data in the browser and you use "Import .xlsx" to load the workbook
and "Export copy" to write a new one — the same data, one manual step.

A copy of your data also lives in the browser as a cache, so nothing is lost
if the workbook is temporarily unavailable. Nothing is ever uploaded anywhere.

DAILY USE
---------
Dashboard  KPIs and charts for the selected day, week or month, plus today's
           on-shift list.
Rota       Weekly grid (click any cell to add or edit that shift) and the full
           shift table. "Add shift" = Employee > Date > Start > End > Break > Save.
Employees  Add, edit and delete staff. Deleting always asks to confirm.
Reports    Per-employee scheduled vs actual, variance, overtime, weekly trend,
           and breakdowns by contract type and job role.
Settings   Standard weekly hours (overtime threshold), long-shift alert, the
           job-role list, and the Excel buttons.

Filters at the top of the screen work together: Day/Week/Month + contract type
+ employee + job role. Everything below updates instantly.

HOURS ARE CALCULATED FOR YOU
----------------------------
Overnight shifts are handled: 18:00 -> 02:00 is 8 hours. Breaks are deducted:
18:00 -> 02:00 with a 30-minute break is 7.5 paid hours. Overtime is any hours
above the standard weekly figure in Settings (40 by default), counted per
employee per week.

Colour coding on the rota: red-tinted cells and flags mean missing times or
missing actual hours; "Over schedule" and "Long shift" flag anything unusual;
overtime totals show in the brand red.

EXCEL — WHAT THE WORKBOOK CONTAINS
----------------------------------
The starter file in data/ holds Employees, Rota and Settings. The first time
the app saves to it, it is rewritten with the full seven sheets below. "Export
copy" downloads the same workbook as a dated backup
(The-Pint-Bar-Rota-YYYY-MM-DD.xlsx) without touching the linked file.

Seven sheets, with live formulas that recalculate in Excel:
   Dashboard   Headline counts, hours and overtime.
   Employees   Your staff database + per-person hour totals.
   Rota        Every shift, with hours formulas (overnight-safe) and
               contract/role looked up from Employees.
   Timesheet   Scheduled vs actual vs variance per shift.
   Weekly      Paid hours and overtime per employee per week.
   Reports     Totals by contract type and by job role.
   Settings    Standard weekly hours and the dropdown value lists.

Headers are frozen, filters are on, and columns are sized. Keep the workbook
in this same folder if you'd like everything in one place.

EXCEL — IMPORTING
-----------------
Click "Import .xlsx" (top right) and pick a workbook. The app reads the
Employees and Rota sheets, matches staff by Employee ID (or by name if the ID
is missing), and recalculates all hours. Dates as 2026-09-12 or 12/09/2026 and
times as 18:00 are both understood.

Safe editing round trip without linking:
   Open Timesheet.html -> Import the workbook -> edit -> Export copy -> keep
   that file as your new master.

Please note: the workbook carries live formulas, frozen panes, filters and
column widths, but not cell fill colours or dropdown validation — a browser
cannot write those. The colour coding and dropdowns live in the app itself.

TROUBLESHOOTING
---------------
Blank page                 Try another browser; or check the file was copied
                           whole (it should be roughly 750 KB).
Changes not saving         Close the workbook in Excel — a file open in Excel
                           is locked. Then click "Save now".
"Reconnect Excel file"     Normal after a browser restart; click it once.
My data disappeared        You opened it in a different browser or a private
                           window, or the workbook was moved. Link the file
                           again, or import your last export.
Import did nothing         The workbook needs a sheet named "Employees" or
                           "Rota". Export one from the app to see the layout.
Wrong overtime figures     Check Standard weekly hours in Settings.

Sample records are labelled "sample record" in the Notes column — replace or
clear them before you go live.
