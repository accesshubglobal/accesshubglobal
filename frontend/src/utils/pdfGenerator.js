/**
 * Generates a styled, branded PDF summary of an application for AccessHub Global.
 *
 * @param {Object} params
 * @param {Object} params.application - Application data (userName, documents, etc.)
 * @param {Object} [params.offer]     - Offer details (university, city, country, fees...)
 * @param {Object} [params.user]      - Logged-in user (fallback for name/email)
 * @param {('save'|'base64')} [params.output='save'] - 'save' triggers download; 'base64' returns raw base64 string.
 * @returns {Promise<string|void>} base64 string (without data-URL prefix) when output='base64'.
 */
export async function generateApplicationPDF({ application, offer, user, output = 'save' }) {
  const html2pdf = (await import('html2pdf.js')).default;
  const LOGO_URL = (await import('../assets/accesshubLogo')).default;
  const COMPANY = {
    name: 'AccessHub Global',
    slogan: "Votre passerelle vers l'excellence académique internationale",
    email: 'accesshubglobal@gmail.com',
    phone: '+86 13881130175',
    website: 'accesshubglobal.com',
  };

  const fmt = (v, fallback = '—') => (v !== undefined && v !== null && v !== '' ? v : fallback);
  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return d;
    }
  };
  const fmtMoney = (n, cur = 'CNY') =>
    n && Number(n) > 0 ? `${Number(n).toLocaleString('fr-FR')} ${cur}` : '—';

  const statusLabels = {
    pending: 'En attente', approved: 'Approuvée', accepted: 'Acceptée',
    rejected: 'Rejetée', modify: 'À modifier', reviewing: 'En examen',
  };
  const statusColors = {
    pending: '#f59e0b', approved: '#10b981', accepted: '#10b981',
    rejected: '#ef4444', modify: '#f97316', reviewing: '#3b82f6',
  };
  const status = application.status || 'pending';

  const firstName = fmt(application.firstName || user?.firstName);
  const lastName = fmt(application.lastName || user?.lastName);
  const email = fmt(application.userEmail || application.personalEmail || user?.email);
  const refId = (application.id || '').substring(0, 8).toUpperCase();

  const idPhotoDoc = (application.documents || []).find(
    (d) => d && typeof d === 'object' && (d.name === "Photo d'identité" || d.name === 'Photo identité')
  );
  const idPhotoUrl = idPhotoDoc?.url || '';

  const section = (title, content) => `
    <div style="margin-bottom:20px;page-break-inside:avoid;">
      <div style="font-size:11px;font-weight:800;color:#1a56db;text-transform:uppercase;letter-spacing:1.5px;border-bottom:2px solid #1a56db;padding-bottom:5px;margin-bottom:10px;">${title}</div>
      ${content}
    </div>`;

  const row = (k, v) => `
    <td style="width:50%;padding:6px 8px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
      <div style="font-size:8px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px;">${k}</div>
      <div style="font-size:11px;color:#111827;font-weight:500;">${v}</div>
    </td>`;

  const pairTable = (pairs) => {
    const rows = [];
    for (let i = 0; i < pairs.length; i += 2) {
      const a = pairs[i];
      const b = pairs[i + 1];
      rows.push(`<tr>${row(a[0], a[1])}${b ? row(b[0], b[1]) : '<td style="width:50%;"></td>'}</tr>`);
    }
    return `<table style="width:100%;border-collapse:collapse;">${rows.join('')}</table>`;
  };

  // ───── OFFER ─────
  const offerTable = pairTable([
    ['Diplôme', fmt(offer?.degree)],
    ['Durée', fmt(offer?.duration)],
    ["Langue d'enseignement", fmt(offer?.teachingLanguage)],
    ['Rentrée', fmt(offer?.intake)],
    ['Date limite', fmt(offer?.deadline, 'Ouvert')],
    ['Bourse', offer?.hasScholarship ? fmt(offer?.scholarshipType, 'Disponible') : 'Non'],
    ['Catégorie', fmt(offer?.categoryLabel || offer?.category)],
    ['ID Offre', (offer?.id || '').substring(0, 8).toUpperCase() || '—'],
  ]);

  const description = offer?.description
    ? `<div style="margin-top:10px;padding:10px;background:#f8fafc;border-radius:6px;font-size:10px;color:#4b5563;line-height:1.6;white-space:pre-wrap;">${offer.description}</div>`
    : '';

  // Admission conditions
  const conditionsHtml = (offer?.admissionConditions || [])
    .map((c) => {
      if (typeof c === 'string') return c ? `<li style="margin-bottom:3px;">${c}</li>` : '';
      const label = c?.condition || c?.title || c?.text || c?.label || '';
      const detail = c?.description || '';
      if (!label && !detail) return '';
      return `<li style="margin-bottom:3px;"><strong>${label}</strong>${detail ? ` — <span style="color:#6b7280;">${detail}</span>` : ''}</li>`;
    })
    .filter(Boolean)
    .join('');
  const admissionBlock = conditionsHtml
    ? `<div style="margin-top:10px;"><div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Conditions d'admission</div><ul style="margin:0;padding-left:18px;font-size:10px;color:#374151;line-height:1.6;">${conditionsHtml}</ul></div>`
    : '';

  // ───── FEES ─────
  const currency = offer?.currency || 'CNY';
  const fees = offer?.fees || {};
  const feesRows = [
    ['Frais de scolarité', fees.originalTuition],
    ['Scolarité après bourse', fees.scholarshipTuition],
    ['Hébergement (double)', fees.accommodationDouble],
    ['Hébergement (single)', fees.accommodationSingle],
    ["Frais d'inscription", fees.registrationFee],
    ['Assurance', fees.insuranceFee],
    ['Frais de dossier', fees.applicationFee],
    ['Frais de service', offer?.serviceFee],
  ]
    .filter(([, v]) => v && Number(v) > 0)
    .map(([k, v]) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#4b5563;">${k}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#111827;font-weight:700;text-align:right;">${fmtMoney(v, currency)}</td>
      </tr>`)
    .join('');

  // ───── APPLICANT ─────
  const applicantPhoto = idPhotoUrl
    ? `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:10px;">
        <img src="${idPhotoUrl}" alt="Photo" crossorigin="anonymous" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid #e5e7eb;"/>
        <div>
          <div style="font-size:14px;font-weight:700;color:#0f1f35;">${firstName} ${lastName}</div>
          <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Photo d'identité</div>
        </div>
      </div>`
    : '';

  const applicantTable = pairTable([
    ['Nom', lastName],
    ['Prénom', firstName],
    ['Sexe', fmt(application.sex)],
    ['Nationalité', fmt(application.nationality)],
    ['Date de naissance', fmtDate(application.dateOfBirth)],
    ['Lieu de naissance', fmt(application.placeOfBirth)],
    ['Pays de naissance', fmt(application.countryOfBirth)],
    ['Langue maternelle', fmt(application.nativeLanguage)],
    ['Religion', fmt(application.religion)],
    ['Situation matrimoniale', fmt(application.maritalStatus)],
    ['Profession', fmt(application.occupation)],
    ['Loisirs', fmt(application.hobby)],
    ['Téléphone', fmt(application.phoneNumber || application.phone)],
    ['Email', email],
  ]);

  // ───── ADDRESS ─────
  const addressTable = pairTable([
    ['Adresse permanente', fmt(application.address)],
    ['Adresse détaillée', fmt(application.addressDetailed)],
    ['Téléphone adresse', fmt(application.addressPhone)],
    ['Code postal', fmt(application.zipCode)],
    ['Adresse actuelle', fmt(application.currentAddress)],
    ['Adresse actuelle détaillée', fmt(application.currentAddressDetailed)],
    ['Téléphone actuel', fmt(application.currentAddressPhone)],
    ['Code postal actuel', fmt(application.currentAddressZipCode)],
  ]);

  // ───── HEALTH ─────
  const healthTable = pairTable([
    ['Groupe sanguin', fmt(application.bloodGroup)],
    ['Taille (cm)', fmt(application.height)],
    ['Poids (kg)', fmt(application.weight)],
  ]);

  // ───── PASSPORT ─────
  const passportTable = pairTable([
    ['N° Passeport', fmt(application.passportNumber)],
    ['Date de délivrance', fmtDate(application.passportIssuedDate)],
    ['Date d\'expiration', fmtDate(application.passportExpiryDate)],
    ['Ancien N° passeport', fmt(application.oldPassportNo)],
    ['Ancien délivrance', fmtDate(application.oldPassportIssuedDate)],
    ['Ancien expiration', fmtDate(application.oldPassportExpiryDate)],
  ]);

  // ───── CHINA (conditional) ─────
  const chinaBlock = application.inChinaNow ? section('Séjour en Chine', pairTable([
    ['École/Organisation', fmt(application.chinaSchool)],
    ['Type de visa', fmt(application.chinaVisaType)],
    ['N° Visa', fmt(application.chinaVisaNo)],
    ['Expiration visa', fmtDate(application.chinaVisaExpiry)],
    ['Du', fmtDate(application.chinaLearningPeriodStart)],
    ['Au', fmtDate(application.chinaLearningPeriodEnd)],
  ])) : '';

  // ───── EDUCATION ─────
  const educationRows = (application.educationalBackground || [])
    .filter((e) => e && e.instituteName)
    .map((e, i) => `
      <tr>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">
          <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;">École ${String.fromCharCode(65 + i)}</div>
          <div style="font-size:11px;font-weight:700;color:#0f1f35;">${fmt(e.instituteName)}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:3px;">${fmt(e.educationLevel)} · ${fmt(e.fieldOfStudy)}</div>
          <div style="font-size:9px;color:#9ca3af;margin-top:3px;">${fmtDate(e.yearsFrom)} → ${fmtDate(e.yearsTo)}</div>
        </td>
      </tr>`)
    .join('');
  const educationBlock = educationRows
    ? section('Formation académique', `<table style="width:100%;border-collapse:collapse;">${educationRows}</table>`)
    : '';

  // ───── WORK ─────
  const workRows = (application.workExperience || [])
    .filter((w) => w && w.companyName)
    .map((w, i) => `
      <tr>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">
          <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;">Expérience ${String.fromCharCode(65 + i)}</div>
          <div style="font-size:11px;font-weight:700;color:#0f1f35;">${fmt(w.companyName)}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:3px;">${fmt(w.position)} · ${fmt(w.industryType)}</div>
          <div style="font-size:9px;color:#9ca3af;margin-top:3px;">${fmtDate(w.yearsFrom)} → ${fmtDate(w.yearsTo)}</div>
          ${w.contactPerson ? `<div style="font-size:9px;color:#6b7280;margin-top:3px;">Réf : ${w.contactPerson}${w.contactPhone ? ` · ${w.contactPhone}` : ''}${w.contactEmail ? ` · ${w.contactEmail}` : ''}</div>` : ''}
        </td>
      </tr>`)
    .join('');
  const workBlock = workRows
    ? section('Expérience professionnelle', `<table style="width:100%;border-collapse:collapse;">${workRows}</table>`)
    : '';

  // ───── FAMILY ─────
  const familyMember = (label, info) => {
    if (!info || !info.name) return '';
    return `
      <tr>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">
          <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;">${label}</div>
          <div style="font-size:11px;font-weight:700;color:#0f1f35;">${fmt(info.name)}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:3px;">${fmt(info.occupation)} · ${fmt(info.nationality)}</div>
          <div style="font-size:9px;color:#9ca3af;margin-top:3px;">
            ${info.dob ? `Né(e) : ${fmtDate(info.dob)} · ` : ''}${info.idNo ? `ID : ${info.idNo} · ` : ''}${info.mobile || '—'}${info.email ? ` · ${info.email}` : ''}
          </div>
          ${info.employer ? `<div style="font-size:9px;color:#6b7280;margin-top:2px;">Employeur : ${info.employer}</div>` : ''}
        </td>
      </tr>`;
  };
  const familyRows = [
    familyMember('Père', application.fatherInfo),
    familyMember('Mère', application.motherInfo),
    familyMember('Conjoint(e)', application.spouseInfo),
  ].filter(Boolean).join('');
  const familyBlock = familyRows
    ? section('Informations familiales', `<table style="width:100%;border-collapse:collapse;">${familyRows}</table>`)
    : '';

  // ───── SPONSOR & EMERGENCY ─────
  const sponsorBlock = (application.financialSponsor?.relationship || application.financialSponsor?.address)
    ? section('Garant financier', pairTable([
        ['Relation', fmt(application.financialSponsor.relationship)],
        ['Adresse', fmt(application.financialSponsor.address)],
      ]))
    : '';

  const emergency = application.emergencyContact || {};
  const emergencyBlock = emergency.name
    ? section("Contact d'urgence", pairTable([
        ['Nom', fmt(emergency.name)],
        ['Relation', fmt(emergency.relationship)],
        ['Profession', fmt(emergency.occupation)],
        ['Nationalité', fmt(emergency.nationality)],
        ['N° Pièce d\'identité', fmt(emergency.idNo)],
        ['Employeur', fmt(emergency.employer)],
        ['Adresse en Chine', fmt(emergency.addressChina)],
        ['Téléphone', fmt(emergency.phone)],
        ['Email', fmt(emergency.email)],
      ]))
    : '';

  // ───── PAYMENT ─────
  const paymentMethodLabels = {
    wechat_alipay: 'WeChat / Alipay',
    paypal: 'PayPal',
    bank_transfer: 'Virement bancaire',
    cash: 'Espèces',
  };
  const paymentBlock = application.paymentMethod
    ? section('Paiement', pairTable([
        ['Méthode', paymentMethodLabels[application.paymentMethod] || application.paymentMethod],
        ['Montant', application.paymentAmount ? `${Number(application.paymentAmount).toLocaleString('fr-FR')} ${currency}` : '—'],
        ['Statut paiement', statusLabels[application.paymentStatus] || fmt(application.paymentStatus)],
      ]))
    : '';

  // ───── DOCUMENTS ─────
  const docsRows = (application.documents || [])
    .map((doc, i) => {
      const name = typeof doc === 'object' ? (doc?.name || doc?.filename || `Document ${i + 1}`) : `Document ${i + 1}`;
      const fname = typeof doc === 'object' ? (doc?.filename || '') : '';
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151;">${i + 1}. ${name}${fname ? ` <span style="color:#9ca3af;">· ${fname}</span>` : ''}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#10b981;text-align:right;">✓ Soumis</td>
      </tr>`;
    }).join('');

  const html = `
<div id="ahg-pdf-root" style="font-family:'Helvetica Neue',Arial,sans-serif;color:#111827;background:#ffffff;width:800px;padding:0;margin:0;">

  <!-- LETTERHEAD -->
  <div style="background:linear-gradient(135deg,#0f1f35 0%,#1a56db 100%);padding:24px 40px;color:#fff;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:middle;">
          <img src="${LOGO_URL}" alt="${COMPANY.name}" style="height:70px;width:auto;display:block;background:#fff;border-radius:10px;padding:8px 14px;"/>
        </td>
        <td style="vertical-align:middle;text-align:right;font-size:10px;color:#dbeafe;line-height:1.7;">
          <div style="font-size:11px;font-weight:700;color:#fff;margin-bottom:2px;">${COMPANY.name}</div>
          <div style="font-style:italic;color:#bfdbfe;margin-bottom:6px;">${COMPANY.slogan}</div>
          <div>📞 ${COMPANY.phone}</div>
          <div>✉ ${COMPANY.email}</div>
          <div>🌐 ${COMPANY.website}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- REF BAND -->
  <div style="background:#f8fafc;border-bottom:1px solid #e5e7eb;padding:12px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;">Récapitulatif de candidature</div>
      <div style="font-size:14px;font-weight:700;color:#0f1f35;margin-top:2px;">Référence : #${refId}</div>
    </div>
    <div style="text-align:right;">
      <span style="display:inline-block;padding:5px 14px;background:${statusColors[status] || '#6b7280'};color:#fff;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${statusLabels[status] || status}</span>
      <div style="font-size:10px;color:#6b7280;margin-top:6px;">Soumise le ${fmtDate(application.createdAt)}</div>
    </div>
  </div>

  <div style="padding:24px 40px;">
    ${section('Programme', `
      <div style="font-size:15px;font-weight:800;color:#0f1f35;margin-bottom:4px;">${fmt(application.offerTitle || offer?.title)}</div>
      <div style="font-size:11px;color:#4b5563;margin-bottom:10px;">🎓 ${fmt(offer?.university)} · 📍 ${fmt(offer?.city)}, ${fmt(offer?.country)}</div>
      ${offerTable}
      ${description}
      ${admissionBlock}
    `)}

    ${feesRows ? section('Frais et tarifs', `<table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">${feesRows}</table>`) : ''}

    ${section('Informations du candidat', applicantPhoto + applicantTable)}

    ${section('Adresses', addressTable)}

    ${section('État de santé', healthTable)}

    ${section('Passeport', passportTable)}

    ${chinaBlock}

    ${educationBlock}

    ${workBlock}

    ${familyBlock}

    ${sponsorBlock}

    ${emergencyBlock}

    ${paymentBlock}

    ${docsRows ? section('Documents soumis', `<table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">${docsRows}</table>`) : ''}
  </div>

  <!-- FOOTER -->
  <div style="background:#0f1f35;color:#dbeafe;padding:18px 40px;text-align:center;font-size:10px;line-height:1.6;">
    <div style="font-weight:700;color:#ffffff;font-size:12px;margin-bottom:4px;">${COMPANY.name}</div>
    <div>${COMPANY.slogan}</div>
    <div style="margin-top:6px;color:#93c5fd;">📞 ${COMPANY.phone} · ✉ ${COMPANY.email} · 🌐 ${COMPANY.website}</div>
    <div style="margin-top:8px;font-size:9px;color:#64748b;">Document généré automatiquement le ${fmtDate(new Date())} — Récapitulatif officiel AccessHub Global.</div>
  </div>
</div>
  `;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = html;
  document.body.appendChild(container);

  const element = container.firstElementChild;

  const opt = {
    margin: 0,
    filename: `AccessHub-Candidature-${refId || 'recap'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  try {
    const worker = html2pdf().set(opt).from(element);
    if (output === 'base64') {
      const dataUrl = await worker.outputPdf('datauristring');
      const comma = dataUrl.indexOf(',');
      return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    }
    await worker.save();
  } finally {
    document.body.removeChild(container);
  }
}
