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

  const LOGO_URL =
    'https://customer-assets.emergentagent.com/job_d923ae2e-8158-4a92-a0e5-0f06423a47f2/artifacts/he94oysv_sans.PNG';
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
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };
  const fmtMoney = (n, cur = 'CNY') =>
    n && Number(n) > 0 ? `${Number(n).toLocaleString('fr-FR')} ${cur}` : '—';

  const statusLabels = {
    pending: 'En attente',
    approved: 'Approuvée',
    rejected: 'Rejetée',
    modify: 'À modifier',
    in_review: 'En revue',
  };
  const statusColors = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    modify: '#f97316',
    in_review: '#3b82f6',
  };
  const status = application.status || 'pending';

  const firstName = fmt(application.firstName || user?.firstName);
  const lastName = fmt(application.lastName || user?.lastName);
  const email = fmt(application.userEmail || application.personalEmail || user?.email);
  const refId = (application.id || '').substring(0, 8).toUpperCase();

  const docsRows = (application.documents || [])
    .map((doc, i) => {
      const name = typeof doc === 'object' ? doc?.name || doc?.filename || `Document ${i + 1}` : `Document ${i + 1}`;
      return `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151;">${i + 1}. ${name}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#10b981;text-align:right;">✓ Soumis</td></tr>`;
    })
    .join('');

  const currency = offer?.currency || 'CNY';
  const fees = offer?.fees || {};
  const feesRows = [
    ['Frais de scolarité', fmtMoney(fees.originalTuition, currency)],
    ['Scolarité après bourse', fmtMoney(fees.scholarshipTuition, currency)],
    ['Hébergement (double)', fmtMoney(fees.accommodationDouble, currency)],
    ['Hébergement (single)', fmtMoney(fees.accommodationSingle, currency)],
    ['Frais d\'inscription', fmtMoney(fees.registrationFee, currency)],
    ['Assurance', fmtMoney(fees.insuranceFee, currency)],
    ['Frais de dossier', fmtMoney(fees.applicationFee, currency)],
    ['Frais de service', fmtMoney(offer?.serviceFee, currency)],
  ]
    .filter(([, v]) => v !== '—')
    .map(
      ([k, v]) => `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#4b5563;">${k}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#111827;font-weight:600;text-align:right;">${v}</td>
    </tr>`
    )
    .join('');

  const html = `
<div id="ahg-pdf-root" style="font-family:'Helvetica Neue',Arial,sans-serif;color:#111827;background:#ffffff;width:800px;padding:0;margin:0;">

  <!-- LETTERHEAD -->
  <div style="background:linear-gradient(135deg,#0f1f35 0%,#1a56db 100%);padding:28px 40px;display:flex;align-items:center;justify-content:space-between;color:#fff;">
    <div style="display:flex;align-items:center;gap:16px;">
      <img src="${LOGO_URL}" alt="${COMPANY.name}" style="height:64px;width:auto;background:#fff;border-radius:10px;padding:6px;"/>
      <div>
        <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;line-height:1;">${COMPANY.name}</div>
        <div style="font-size:11px;color:#bfdbfe;margin-top:6px;font-style:italic;">${COMPANY.slogan}</div>
      </div>
    </div>
    <div style="text-align:right;font-size:10px;color:#dbeafe;line-height:1.6;">
      <div>📞 ${COMPANY.phone}</div>
      <div>✉ ${COMPANY.email}</div>
      <div>🌐 ${COMPANY.website}</div>
    </div>
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

  <div style="padding:28px 40px;">

    <!-- PROGRAMME -->
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a56db;padding-bottom:6px;margin-bottom:12px;">Programme</div>
      <div style="font-size:17px;font-weight:800;color:#0f1f35;margin-bottom:4px;">${fmt(application.offerTitle || offer?.title)}</div>
      <div style="font-size:12px;color:#4b5563;">🎓 ${fmt(offer?.university)} · 📍 ${fmt(offer?.city)}, ${fmt(offer?.country)}</div>
      <table style="width:100%;margin-top:12px;border-collapse:collapse;">
        <tr>
          <td style="width:33%;padding:8px 10px;background:#f8fafc;border:1px solid #e5e7eb;">
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Diplôme</div>
            <div style="font-size:11px;font-weight:600;color:#111827;">${fmt(offer?.degree)}</div>
          </td>
          <td style="width:33%;padding:8px 10px;background:#f8fafc;border:1px solid #e5e7eb;">
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Durée</div>
            <div style="font-size:11px;font-weight:600;color:#111827;">${fmt(offer?.duration)}</div>
          </td>
          <td style="width:33%;padding:8px 10px;background:#f8fafc;border:1px solid #e5e7eb;">
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Langue</div>
            <div style="font-size:11px;font-weight:600;color:#111827;">${fmt(offer?.teachingLanguage)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 10px;background:#f8fafc;border:1px solid #e5e7eb;">
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Rentrée</div>
            <div style="font-size:11px;font-weight:600;color:#111827;">${fmt(offer?.intake)}</div>
          </td>
          <td style="padding:8px 10px;background:#f8fafc;border:1px solid #e5e7eb;">
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Date limite</div>
            <div style="font-size:11px;font-weight:600;color:#111827;">${fmt(offer?.deadline, 'Ouvert')}</div>
          </td>
          <td style="padding:8px 10px;background:#f8fafc;border:1px solid #e5e7eb;">
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Bourse</div>
            <div style="font-size:11px;font-weight:600;color:${offer?.hasScholarship ? '#047857' : '#111827'};">${offer?.hasScholarship ? fmt(offer?.scholarshipType, 'Disponible') : 'Non'}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- APPLICANT -->
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a56db;padding-bottom:6px;margin-bottom:12px;">Informations du candidat</div>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ['Nom', lastName],
          ['Prénom', firstName],
          ['Email', email],
          ['Téléphone', fmt(application.phoneNumber || application.phone)],
          ['Date de naissance', fmtDate(application.dateOfBirth)],
          ['Lieu de naissance', fmt(application.placeOfBirth)],
          ['Sexe', fmt(application.sex)],
          ['Nationalité', fmt(application.nationality)],
          ['N° passeport', fmt(application.passportNumber)],
          ['Expiration passeport', fmtDate(application.passportExpiryDate)],
          ['Profession', fmt(application.occupation)],
          ['Niveau d\'études', fmt(application.highestEducation)],
          ['Filière souhaitée', fmt(application.majorInChina)],
          ['Adresse', fmt(application.address)],
        ]
          .reduce((rows, pair, i) => {
            const col = i % 2;
            if (col === 0) rows.push([]);
            rows[rows.length - 1].push(pair);
            return rows;
          }, [])
          .map(
            (row) =>
              `<tr>${row
                .map(
                  ([k, v]) =>
                    `<td style="width:50%;padding:7px 10px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                      <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">${k}</div>
                      <div style="font-size:11px;color:#111827;font-weight:500;">${v}</div>
                    </td>`
                )
                .join('')}${row.length === 1 ? '<td style="width:50%;"></td>' : ''}</tr>`
          )
          .join('')}
      </table>
    </div>

    <!-- EMERGENCY CONTACT -->
    ${
      application.emergencyContact && (application.emergencyContact.name || application.emergencyContact.phone)
        ? `<div style="margin-bottom:24px;">
            <div style="font-size:12px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a56db;padding-bottom:6px;margin-bottom:12px;">Contact d'urgence</div>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:50%;padding:7px 10px;border-bottom:1px solid #f3f4f6;">
                  <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Nom</div>
                  <div style="font-size:11px;color:#111827;font-weight:500;">${fmt(application.emergencyContact.name)}</div>
                </td>
                <td style="width:50%;padding:7px 10px;border-bottom:1px solid #f3f4f6;">
                  <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Téléphone</div>
                  <div style="font-size:11px;color:#111827;font-weight:500;">${fmt(application.emergencyContact.phone)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:7px 10px;border-bottom:1px solid #f3f4f6;">
                  <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Relation</div>
                  <div style="font-size:11px;color:#111827;font-weight:500;">${fmt(application.emergencyContact.relationship)}</div>
                </td>
                <td style="padding:7px 10px;border-bottom:1px solid #f3f4f6;">
                  <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Email</div>
                  <div style="font-size:11px;color:#111827;font-weight:500;">${fmt(application.emergencyContact.email)}</div>
                </td>
              </tr>
            </table>
          </div>`
        : ''
    }

    <!-- FEES -->
    ${
      feesRows
        ? `<div style="margin-bottom:24px;">
            <div style="font-size:12px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a56db;padding-bottom:6px;margin-bottom:12px;">Frais et tarifs</div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
              ${feesRows}
            </table>
          </div>`
        : ''
    }

    <!-- DOCUMENTS -->
    ${
      docsRows
        ? `<div style="margin-bottom:24px;">
            <div style="font-size:12px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a56db;padding-bottom:6px;margin-bottom:12px;">Documents soumis</div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">${docsRows}</table>
          </div>`
        : ''
    }

  </div>

  <!-- FOOTER -->
  <div style="background:#0f1f35;color:#dbeafe;padding:20px 40px;text-align:center;font-size:10px;line-height:1.7;">
    <div style="font-weight:700;color:#ffffff;font-size:12px;margin-bottom:4px;">${COMPANY.name}</div>
    <div>${COMPANY.slogan}</div>
    <div style="margin-top:8px;color:#93c5fd;">📞 ${COMPANY.phone} · ✉ ${COMPANY.email} · 🌐 ${COMPANY.website}</div>
    <div style="margin-top:10px;font-size:9px;color:#64748b;">Ce document est un récapitulatif officiel généré automatiquement le ${fmtDate(new Date())}.</div>
  </div>

</div>
  `;

  // Off-screen render container
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
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    const worker = html2pdf().set(opt).from(element);
    if (output === 'base64') {
      const dataUrl = await worker.outputPdf('datauristring');
      // Return raw base64 (strip "data:application/pdf;base64," prefix)
      const comma = dataUrl.indexOf(',');
      return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    }
    await worker.save();
  } finally {
    document.body.removeChild(container);
  }
}
