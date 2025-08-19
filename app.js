// app.js
// 1) Dismissable notice (already in your HTML, kept safe)
(function(){try{
  var k='ac-classroomscreen-lic-dismissed', e=document.getElementById('cs-lic-alert');
  if(!e) return; if(localStorage.getItem(k)==='1') e.style.display='none';
  var b=e.querySelector('.alert-close');
  b && b.addEventListener('click', function(){
    var w=this.closest('.dismissible'); if(w){ w.style.display='none'; localStorage.setItem(k,'1'); }
  });
}catch(_){} })();

// 2) Data-gedreven stappen: per tool en tab
const FLOW_DATA = {
  onedrive: {
    'Inloggen': [
      'Ga naar office.com en kies “Aanmelden”.',
      'Log in met je @almerecollege.nl account.',
      'Klik linksboven op de “wafels” en open OneDrive.'
    ],
    'Mappen': [
      'Klik op “Nieuw” → “Map”.',
      'Gebruik een duidelijke naam (bv. Klas • Vak • Jaar).',
      'Open de map en voeg submappen toe voor structuur.'
    ],
    'Uploaden': [
      'Open de juiste map.',
      'Klik “Uploaden” → “Bestanden” of sleep bestanden in het venster.',
      'Wacht tot het vinkje verschijnt (gesynchroniseerd).'
    ],
    'Delen': [
      'Selecteer bestand/map → “Delen”.',
      'Kies wie toegang krijgt (alleen personen binnen AC of specifieke personen).',
      'Zet rechten op “Mag bewerken” of “Alleen weergeven” en verstuur.'
    ]
  },
  printen: {
    'Printen': [
      'Kies bij de printer “FollowMe”.',
      'Gebruik A4/A3 en zet dubbelzijdig aan indien gewenst.',
      'Loop naar een Ricoh-printer, houd je tag/druppel voor de lezer.',
      'Kies “FollowMe-print” en druk je taak af.',
      'Nog geen tag? Gebruik de knop “Tag koppelen (PDF)” hierboven.'
    ]
  },
  teams: {
    'Inloggen': [
      'Open teams.microsoft.com of de Teams-app.',
      'Log in met je @almerecollege.nl account.',
      'Kies je school/tenant indien gevraagd.'
    ],
    'Vergadering': [
      'Klik “Agenda” → “Nieuwe vergadering”.',
      'Voeg titel, datum/tijd en genodigden toe.',
      'Kies “Onlinevergadering” en klik “Opslaan/Verzenden”.'
    ],
    'Team maken': [
      'Klik “Teams” → “Een team maken of deelnemen”.',
      'Kies “Team maken” → type (klas, PLC, etc.).',
      'Geef een naam, beschrijving en voeg leden toe.'
    ],
    'Bestanden': [
      'Open een kanaal → tab “Bestanden”.',
      'Upload of maak een nieuw document (Word/Excel/OneNote).',
      'Gebruik “Delen” of “Koppeling kopiëren” voor collega’s/leerlingen.'
    ]
  },
  foleta: {
    'Inloggen': [
      'Ga naar inloggen.foleta.nl.',
      'Log in met je schoolaccount of instructies van P&O.',
      'Kies je organisatie/locatie als daarom wordt gevraagd.'
    ],
    'Roosterwensen': [
      'Open het formulier “Roosterwensen”.',
      'Vul beschikbaarheid en voorkeuren zorgvuldig in.',
      'Controleer en verstuur vóór de deadline (januaribrief).'
    ],
    'PB-uren / Lesreductie': [
      'Open “PB-uren / Lesreductie”.',
      'Selecteer type uren en motiveer indien nodig.',
      'Bewaar en dien in; noteer de bevestiging.'
    ]
  },
  afas: {
    'Inloggen': [
      'Open AFAS InSite en kies “Inloggen”.',
      'Gebruik je @almerecollege.nl account of SSO.',
      'Kies het juiste portaal als je meerdere ziet.'
    ],
    'Verlof': [
      'Ga naar “Verlof” → “Nieuwe aanvraag”.',
      'Kies verloftype en periode; voeg opmerking toe.',
      'Verzend en volg de status onder “Mijn aanvragen”.'
    ],
    'Declaratie': [
      'Open “Declaraties” → “Nieuwe declaratie”.',
      'Voeg kostenposten en bonnen (foto/pdf) toe.',
      'Verzend ter goedkeuring en volg de status.'
    ],
    'Mijn gegevens': [
      'Ga naar “Mijn gegevens”.',
      'Controleer adres, IBAN en noodcontacten.',
      'Werk wijzigingen bij en sla op.'
    ]
  },
  wolf: {
    'Inloggen': [
      'Ga naar wolf.cito.nl.',
      'Log in met je examinator-account.',
      'Kies het juiste examenjaar en vak.'
    ],
    'Scores invoeren': [
      'Open de juiste kandidaatlijst.',
      'Voer per kandidaat de scores/onderdelen in.',
      'Sla op en controleer op waarschuwingen.'
    ],
    'Tweede correctie': [
      'Open het tweede-correctiescherm.',
      'Vergelijk afwijkende scores en motiveer aanpassingen.',
      'Bevestig en sla het dossier op.'
    ],
    'Export & rapportage': [
      'Ga naar “Rapportages/Export”.',
      'Kies formaat (CSV/PDF) en filters.',
      'Download en archiveer veilig.'
    ]
  },
  classroomscreen: {
    'Inloggen': [
      'Open classroomscreen.com.',
      'Maak een account of log in met schoolmail.',
      'Vraag evt. Pro-licentie aan (zie melding).'
    ],
    'Nieuw scherm': [
      'Klik “Nieuw scherm”.',
      'Kies een achtergrond en geef het scherm een naam.',
      'Sla op zodat je het later terugvindt (Pro).'
    ],
    'Widgets': [
      'Voeg timer, stoplicht, geluidsmeter, QR of tekst toe.',
      'Positioneer door te slepen; pas grootte aan met de hoek.',
      'Bewaar je lay-out (Pro) of laat het open staan.'
    ],
    'Delen': [
      'Klik “Delen” om een link of QR te tonen.',
      'Zet in Presentatiemodus voor de klas.',
      'Kopieer het scherm voor varianten per klas.'
    ]
  }
};

// 3) Renderer: bouw tabs + stappen automatisch
function renderAllFlows(){
  document.querySelectorAll('.flow').forEach(flow=>{
    const model = (flow.dataset.model||'').trim();
    const data = FLOW_DATA[model];
    const tabs = flow.parentElement.querySelector('.tabs');
    if(!data || !tabs) return;

    // Maak tabknoppen
    tabs.innerHTML = '';
    const firstKey = Object.keys(data)[0];
    Object.entries(data).forEach(([label, steps], i)=>{
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='tab-btn';
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected', i===0 ? 'true' : 'false');
      btn.textContent = label;
      btn.addEventListener('click', ()=>{
        tabs.querySelectorAll('.tab-btn').forEach(b=>b.setAttribute('aria-selected','false'));
        btn.setAttribute('aria-selected','true');
        drawSteps(flow, steps);
      });
      tabs.appendChild(btn);
    });

    // Eerste tab renderen
    drawSteps(flow, data[firstKey]);
  });
}

function drawSteps(container, steps){
  const ol = document.createElement('ol');
  ol.className='flow-steps';
  ol.innerHTML = steps.map(s=>`<li>${s}</li>`).join('');
  container.replaceChildren(ol);
}

document.addEventListener('DOMContentLoaded', renderAllFlows);
