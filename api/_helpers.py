from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import jwt
import uuid
import os
import asyncio
import random
import logging

logger = logging.getLogger(__name__)

# ============= EMAIL (RESEND) =============

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')


def _init_resend():
    # Always read fresh from env to handle serverless environments
    api_key = os.environ.get('RESEND_API_KEY', RESEND_API_KEY)
    if api_key:
        import resend
        resend.api_key = api_key
        return resend
    return None


async def send_email(to_email: str, subject: str, html: str):
    resend_mod = _init_resend()
    sender = os.environ.get('SENDER_EMAIL', SENDER_EMAIL)
    if not resend_mod:
        logger.warning(f"Resend not configured, email to {to_email} skipped")
        return None
    try:
        params = {"from": sender, "to": [to_email], "subject": subject, "html": html}
        # Use direct sync call — more reliable in serverless (Vercel) environments
        result = resend_mod.Emails.send(params)
        logger.info(f"Email sent to {to_email}: {result}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return None


def generate_verification_code():
    return str(random.randint(100000, 999999))


async def send_verification_email(email: str, code: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2a5298);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">AccessHub Global</h1>
      </div>
      <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
        <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:18px;">Verification de votre email</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Utilisez le code ci-dessous pour verifier votre adresse email :</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e3a5f;">{code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:0;">Ce code expire dans 15 minutes.</p>
      </div>
    </div>
    """
    return await send_email(email, f"Code de verification: {code}", html)


async def send_password_reset_email(email: str, code: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2a5298);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">AccessHub Global</h1>
      </div>
      <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
        <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:18px;">Reinitialisation du mot de passe</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Vous avez demande la reinitialisation de votre mot de passe. Voici votre code :</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e3a5f;">{code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:0;">Ce code expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    </div>
    """
    return await send_email(email, f"Reinitialisation mot de passe: {code}", html)


# ============= NEWSLETTER =============

SITE_URL = os.environ.get('SITE_URL', 'https://accesshub-cms.preview.emergentagent.com')

def _newsletter_footer():
    return f"""
    <div style="background:#0f1f35;padding:32px 24px;margin-top:0;text-align:center;">
      <p style="color:#ffffff;font-weight:700;font-size:16px;margin:0 0 4px;letter-spacing:0.5px;">AccessHub Global</p>
      <p style="color:#93c5fd;font-size:12px;margin:0 0 20px;">Votre passerelle vers l'excellence académique internationale</p>
      <div style="display:inline-block;margin:0 0 20px;">
        <a href="https://wa.me/message/4KVMCWCH4LQPN1" style="display:inline-block;padding:10px 20px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;margin-right:10px;">WhatsApp</a>
        <a href="{SITE_URL}" style="display:inline-block;padding:10px 20px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Visiter le site</a>
      </div>
      <div style="border-top:1px solid #1e3a5f;padding-top:16px;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">📞 +86 138 811 301 75 &nbsp;|&nbsp; ✉️ accesshubglobal@gmail.com</p>
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">📍 Vanke, Panyu District, Guangzhou, Chine</p>
        <p style="color:#6b7280;font-size:12px;margin:0 0 16px;">📍 34 rue Lénine, Moungali, Brazzaville, Congo</p>
        <p style="color:#4b5563;font-size:11px;margin:0;">Vous recevez cet email car vous êtes inscrit à la newsletter AccessHub Global.</p>
      </div>
    </div>
    """


def _build_offer_email(offer: dict) -> str:
    title = offer.get('title', '')
    university = offer.get('university', '')
    city = offer.get('city', '')
    country = offer.get('country', 'Chine')
    degree = offer.get('degree', '')
    duration = offer.get('duration', '')
    teaching_lang = offer.get('teachingLanguage', '')
    intake = offer.get('intake', '')
    deadline = offer.get('deadline', 'Ouvert')
    description = offer.get('description', '')
    has_scholarship = offer.get('hasScholarship', False)
    scholarship_type = offer.get('scholarshipType', '')
    original_tuition = offer.get('originalTuition', 0)
    scholarship_tuition = offer.get('scholarshipTuition', 0)
    currency = offer.get('currency', 'CNY')
    image = offer.get('image', '')
    offer_id = offer.get('id', '')
    category_label = offer.get('categoryLabel', '')
    service_fee = offer.get('serviceFee', 0)
    offer_url = f"{SITE_URL}"

    scholarship_badge = ""
    if has_scholarship:
        scholarship_badge = f'<span style="display:inline-block;background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-left:8px;">{scholarship_type or "Bourse disponible"}</span>'

    image_block = ""
    if image:
        image_block = f'<img src="{image}" alt="{title}" style="width:100%;max-height:280px;object-fit:cover;display:block;" />'

    tuition_block = ""
    if original_tuition > 0:
        if has_scholarship and scholarship_tuition >= 0:
            tuition_block = f"""
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:separate;border-spacing:12px 0;">
              <tr>
                <td width="48%" style="background:#fef9c3;border-radius:10px;padding:16px;text-align:center;vertical-align:top;">
                  <p style="color:#854d0e;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Frais normaux</p>
                  <p style="color:#92400e;font-size:20px;font-weight:700;margin:0;text-decoration:line-through;">{int(original_tuition):,} {currency}</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#dcfce7;border-radius:10px;padding:16px;text-align:center;vertical-align:top;">
                  <p style="color:#14532d;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Après bourse</p>
                  <p style="color:#166534;font-size:20px;font-weight:700;margin:0;">{int(scholarship_tuition):,} {currency}</p>
                </td>
              </tr>
            </table>"""
        else:
            tuition_block = f"""
            <div style="background:#eff6ff;border-radius:10px;padding:14px;text-align:center;margin:16px 0;">
              <p style="color:#1e40af;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Frais de scolarité</p>
              <p style="color:#1e3a5f;font-size:22px;font-weight:700;margin:0;">{int(original_tuition):,} {currency} / an</p>
            </div>"""

    if service_fee > 0:
        tuition_block += f"""
        <div style="background:#f0fdf4;border:1px dashed #86efac;border-radius:8px;padding:10px 14px;margin-top:8px;text-align:center;">
          <p style="color:#15803d;font-size:12px;margin:0;">Frais de service AccessHub Global : <strong>{int(service_fee):,} {currency}</strong></p>
        </div>"""

    description_block = ""
    if description:
        short_desc = description[:300] + ("..." if len(description) > 300 else "")
        description_block = f'<p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0;">{short_desc}</p>'

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1a56db 100%);padding:28px 32px;text-align:center;">
    <p style="color:#ffffff;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;opacity:0.85;">AccessHub Global</p>
    <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 6px;line-height:1.3;">Nouvelle Opportunité<br>de Bourse !</h1>
    <p style="color:#ffffff;font-size:13px;margin:0;opacity:0.9;">Une nouvelle offre vient d'être ajoutée sur la plateforme</p>
  </div>

  <!-- Cover Image -->
  {image_block}

  <!-- Body -->
  <div style="padding:28px 32px;">

    <!-- Title & University -->
    <div style="border-left:4px solid #1a56db;padding-left:16px;margin-bottom:20px;">
      <h2 style="color:#1e3a5f;font-size:20px;font-weight:700;margin:0 0 6px;line-height:1.3;">{title} {scholarship_badge}</h2>
      <p style="color:#4b5563;font-size:14px;margin:0;">🎓 {university} &nbsp;•&nbsp; 📍 {city}, {country}</p>
      {f'<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">{category_label}</p>' if category_label else ""}
    </div>

    {description_block}

    {tuition_block}

    <!-- Key Details Grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:separate;border-spacing:0 8px;">
      <tr>
        <td width="49%" style="background:#f8fafc;border-radius:8px;padding:12px;vertical-align:top;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 3px;text-transform:uppercase;">Diplôme</p>
          <p style="color:#111827;font-size:14px;font-weight:600;margin:0;">{degree}</p>
        </td>
        <td width="2%"></td>
        <td width="49%" style="background:#f8fafc;border-radius:8px;padding:12px;vertical-align:top;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 3px;text-transform:uppercase;">Durée</p>
          <p style="color:#111827;font-size:14px;font-weight:600;margin:0;">{duration}</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f8fafc;border-radius:8px;padding:12px;vertical-align:top;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 3px;text-transform:uppercase;">Langue d'enseignement</p>
          <p style="color:#111827;font-size:14px;font-weight:600;margin:0;">{teaching_lang}</p>
        </td>
        <td></td>
        <td style="background:#f8fafc;border-radius:8px;padding:12px;vertical-align:top;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 3px;text-transform:uppercase;">Rentrée</p>
          <p style="color:#111827;font-size:14px;font-weight:600;margin:0;">{intake}</p>
        </td>
      </tr>
      <tr>
        <td colspan="3" style="background:{'#fef2f2' if deadline != 'Ouvert' else '#f0fdf4'};border-radius:8px;padding:12px;vertical-align:top;">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 3px;text-transform:uppercase;">Date limite de candidature</p>
          <p style="color:{'#dc2626' if deadline != 'Ouvert' else '#16a34a'};font-size:15px;font-weight:700;margin:0;">⏰ {deadline}</p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="{offer_url}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#1a56db);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(26,86,219,0.4);">
        Postuler maintenant &rarr;
      </a>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin:8px 0 0;">Connectez-vous à votre compte pour soumettre votre candidature</p>

  </div>

  <!-- Footer -->
  {_newsletter_footer()}

</div>
</body>
</html>"""


def _build_blog_email(post: dict) -> str:
    title = post.get('title', '')
    excerpt = post.get('excerpt', '')
    content = post.get('content', '')
    cover_image = post.get('coverImage', '')
    category = post.get('category', '')
    author_name = post.get('authorName', 'AccessHub Global')
    post_id = post.get('id', '')
    created_at = post.get('createdAt', '')
    post_url = f"{SITE_URL}/blog/{post_id}"

    # Format date
    date_str = ""
    if created_at:
        try:
            from datetime import datetime as dt
            d = dt.fromisoformat(created_at.replace('Z', '+00:00'))
            months_fr = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
            date_str = f"{d.day} {months_fr[d.month]} {d.year}"
        except Exception:
            date_str = created_at[:10]

    # Prepare preview text
    preview = excerpt
    if not preview and content:
        import re
        plain = re.sub(r'<[^>]+>', '', content)
        preview = plain[:280] + ("..." if len(plain) > 280 else "")

    cover_block = ""
    if cover_image:
        cover_block = f'<img src="{cover_image}" alt="{title}" style="width:100%;max-height:300px;object-fit:cover;display:block;" />'

    category_map = {
        'general': 'Général', 'visa': 'Visa & Immigration', 'bourse': 'Bourses',
        'vie_etudiante': 'Vie Étudiante', 'conseils': 'Conseils', 'actualites': 'Actualités',
        'chine': 'Chine', 'france': 'France'
    }
    category_label = category_map.get(category, category.capitalize() if category else 'Article')

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#0f4c8a 100%);padding:28px 32px;text-align:center;">
    <p style="color:#93c5fd;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">AccessHub Global — Blog</p>
    <h1 style="color:#ffffff;font-size:21px;font-weight:800;margin:0 0 6px;line-height:1.3;">Nouvel Article Publié</h1>
    <p style="color:#bfdbfe;font-size:13px;margin:0;">Restez informé de l'actualité des études à l'étranger</p>
  </div>

  <!-- Cover Image -->
  {cover_block}

  <!-- Body -->
  <div style="padding:28px 32px;">

    <!-- Category & Meta -->
    <div style="margin-bottom:18px;">
      <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">{category_label}</span>
      {f'<span style="color:#9ca3af;font-size:12px;margin-left:10px;">{date_str}</span>' if date_str else ""}
      {f'<span style="color:#9ca3af;font-size:12px;margin-left:8px;">par {author_name}</span>' if author_name else ""}
    </div>

    <!-- Title -->
    <h2 style="color:#1e3a5f;font-size:22px;font-weight:800;margin:0 0 16px;line-height:1.35;">{title}</h2>

    <!-- Preview -->
    {f'<p style="color:#4b5563;font-size:15px;line-height:1.75;margin:0 0 24px;border-left:3px solid #bfdbfe;padding-left:16px;">{preview}</p>' if preview else ""}

    <!-- Decorative separator -->
    <div style="border-top:1px solid #e5e7eb;margin:24px 0;"></div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="{post_url}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#1a56db);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(26,86,219,0.4);">
        Lire l'article complet &rarr;
      </a>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin:8px 0 0;">Retrouvez tous nos articles sur le blog AccessHub Global</p>

  </div>

  <!-- Footer -->
  {_newsletter_footer()}

</div>
</body>
</html>"""


def _send_email_sync(to_email: str, subject: str, html: str):
    """Purely synchronous email send — works in all environments including Vercel serverless."""
    try:
        api_key = os.environ.get('RESEND_API_KEY', '')
        sender = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
        if not api_key:
            logger.warning(f"RESEND_API_KEY missing, skipping email to {to_email}")
            return None
        import resend
        resend.api_key = api_key
        result = resend.Emails.send({"from": sender, "to": [to_email], "subject": subject, "html": html})
        logger.info(f"Email sent to {to_email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return None


async def broadcast_newsletter_offer(offer: dict):
    try:
        db = get_db()
        subscribers = await db.newsletter.find({}, {"_id": 0, "email": 1}).to_list(10000)
        if not subscribers:
            logger.info("Newsletter offer: no subscribers found")
            return
        html = _build_offer_email(offer)
        subject = f"Nouvelle offre : {offer.get('title', '')} — {offer.get('university', '')} 🎓"
        sent = 0
        for sub in subscribers:
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda email=sub["email"]: _send_email_sync(email, subject, html)
            )
            if result:
                sent += 1
        logger.info(f"Newsletter offer sent to {sent}/{len(subscribers)} subscribers")
    except Exception as e:
        logger.error(f"Newsletter offer broadcast failed: {e}")


async def broadcast_newsletter_blog(post: dict):
    """Send newsletter to all subscribers when a new blog post is published."""
    try:
        db = get_db()
        subscribers = await db.newsletter.find({}, {"_id": 0, "email": 1}).to_list(10000)
        if not subscribers:
            logger.info("Newsletter blog: no subscribers found")
            return
        html = _build_blog_email(post)
        subject = f"Nouvel article : {post.get('title', '')} ✍️"
        sent = 0
        for sub in subscribers:
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda email=sub["email"]: _send_email_sync(email, subject, html)
            )
            if result:
                sent += 1
        logger.info(f"Newsletter blog sent to {sent}/{len(subscribers)} subscribers")
    except Exception as e:
        logger.error(f"Newsletter blog broadcast failed: {e}")


async def broadcast_newsletter_job(offer: dict):
    """Send newsletter to all subscribers when a new job offer is approved."""
    try:
        db = get_db()
        subscribers = await db.newsletter.find({}, {"_id": 0, "email": 1}).to_list(10000)
        if not subscribers:
            logger.info("Newsletter job: no subscribers found")
            return
        company_name = offer.get('companyName', 'AccessHub Global')
        title = offer.get('title', 'Nouvelle offre')
        location = offer.get('location', '')
        contract = offer.get('contractType', '')
        salary = offer.get('salary', '')
        description = offer.get('description', '')[:300] + '...' if offer.get('description', '') else ''
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
            <div style="background: linear-gradient(135deg, #1a56db 0%, #2a5298 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px;">💼 Nouvelle offre d'emploi</h1>
                <p style="color: rgba(255,255,255,0.85); margin-top: 8px;">{company_name} recrute !</p>
            </div>
            <div style="padding: 30px; background: white; border-radius: 0 0 12px 12px;">
                <h2 style="color: #1a56db; font-size: 22px; margin-top: 0;">{title}</h2>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;">
                    <span style="background: #eff6ff; color: #1a56db; padding: 4px 12px; border-radius: 20px; font-size: 13px;">{contract}</span>
                    <span style="background: #f0fdf4; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 13px;">📍 {location}</span>
                    {"<span style='background: #fefce8; color: #ca8a04; padding: 4px 12px; border-radius: 20px; font-size: 13px;'>" + salary + "</span>" if salary else ""}
                </div>
                <p style="color: #374151; line-height: 1.7; margin-bottom: 24px;">{description}</p>
                <div style="text-align: center;">
                    <a href="{os.environ.get('FRONTEND_URL', 'https://accesshub-cms.preview.emergentagent.com')}/emploi"
                       style="background: #1a56db; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                        Voir l'offre
                    </a>
                </div>
            </div>
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">AccessHub Global · Vous recevez cet email car vous êtes abonné à nos notifications.</p>
        </div>"""
        subject = f"Nouvelle offre d'emploi : {title} chez {company_name} 💼"
        sent = 0
        for sub in subscribers:
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda email=sub["email"]: _send_email_sync(email, subject, html)
            )
            if result:
                sent += 1
        logger.info(f"Newsletter job sent to {sent}/{len(subscribers)} subscribers")
    except Exception as e:
        logger.error(f"Newsletter job broadcast failed: {e}")


# ============= DATABASE =============

_client = None
_db = None


def init_db(mongo_url: str, db_name: str):
    global _client, _db
    _client = AsyncIOMotorClient(mongo_url)
    _db = _client[db_name]


def get_db():
    return _db


def close_db():
    global _client
    if _client:
        _client.close()


# ============= SECURITY =============

SECRET_KEY = os.environ.get('JWT_SECRET', 'winners-consulting-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ============= NOTIFICATION HOOKS (for WebSocket in local env) =============

_on_notification = None
_on_admin_broadcast = None


def register_hooks(on_notification=None, on_admin_broadcast=None):
    global _on_notification, _on_admin_broadcast
    if on_notification is not None:
        _on_notification = on_notification
    if on_admin_broadcast is not None:
        _on_admin_broadcast = on_admin_broadcast


# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")

        db = get_db()
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")

        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except (jwt.PyJWTError, jwt.InvalidTokenError, Exception):
        raise HTTPException(status_code=401, detail="Token invalide")


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("admin", "admin_principal", "admin_secondary"):
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return current_user


async def get_principal_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("admin", "admin_principal"):
        raise HTTPException(status_code=403, detail="Accès admin principal requis")
    return current_user


async def get_agent_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "agent":
        raise HTTPException(status_code=403, detail="Accès agent requis")
    if not current_user.get("isApproved", False):
        raise HTTPException(status_code=403, detail="Votre compte agent est en attente d'approbation")
    return current_user


async def get_partner_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "partenaire":
        raise HTTPException(status_code=403, detail="Accès partenaire requis")
    if not current_user.get("isApproved", False):
        raise HTTPException(status_code=403, detail="Votre compte partenaire est en attente d'approbation")
    return current_user


async def get_employer_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "employeur":
        raise HTTPException(status_code=403, detail="Accès employeur requis")
    if not current_user.get("isApproved", False):
        raise HTTPException(status_code=403, detail="Votre compte employeur est en attente d'approbation")
    return current_user


async def get_logement_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "partenaire_logement":
        raise HTTPException(status_code=403, detail="Accès partenaire logement requis")
    if not current_user.get("isApproved", False):
        raise HTTPException(status_code=403, detail="Votre compte est en attente d'approbation")
    return current_user


def serialize_doc(doc: dict) -> dict:
    if doc.get('createdAt') and isinstance(doc['createdAt'], datetime):
        doc['createdAt'] = doc['createdAt'].isoformat()
    return doc


async def send_notification(user_id: str, notification_type: str, title: str, message: str, data: dict = None):
    db = get_db()
    notification = {
        "id": str(uuid.uuid4()),
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    await db.notifications.insert_one({**notification, "userId": user_id})
    if _on_notification:
        await _on_notification(user_id, notification)
    return notification


async def broadcast_to_admins(message: dict):
    if _on_admin_broadcast:
        await _on_admin_broadcast(message)
