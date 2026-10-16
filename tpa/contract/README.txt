THE PINT BAR — STATEMENT OF MAIN TERMS OF EMPLOYMENT
Deployment package

CONTENTS
  index.html                     The document page (entry point)
  js/support.js                  Page runtime (required)
  js/doc-page.js                 Paged A4 document shell (print geometry)
  js/pdf-download.js             "Download PDF" button + client-side PDF builder
  js/field-behaviour.js          Fill-in field behaviour (grey shading clears on typing)
  assets/pintbar-lockup-horizontal.svg   Logo lock-up (cover + page header)
  assets/favicon.svg             Browser tab icon
  docs/The-Pint-Bar-Statement-of-Main-Terms-of-Employment.docx   Editable Word version

DEPLOYMENT
  Upload the whole folder to any static host (Netlify, Vercel, S3, Apache, IIS,
  SharePoint static hosting). No build step and no server-side code required.
  Open index.html at the site root. Must be served over http(s) — opening the
  file directly from disk (file://) blocks the page runtime.

STRUCTURE
  Page 1  Cover — logo lock-up, document title and a date field.
  Pages 2+  The contract clauses, running under a compact logo-only header
            and the branded footer.

NOTES
  - Fonts (Barlow Condensed, Jost) load from Google Fonts; internet access is
    required for correct typography. For a fully offline deployment, self-host
    the two font families and replace the <link> in index.html.
  - The Download PDF button loads html2canvas and jsPDF from a CDN.
  - Printing (Ctrl/Cmd+P) also produces a correctly paginated A4 document.
  - The cover date field is a native date input; fill-in fields elsewhere are
    click-to-type. Values are not saved — print or download the PDF to keep them.
