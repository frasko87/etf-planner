// lib/email.js
// Centralized email service using Resend
// All emails go through here — consistent branding, unsubscribe links

const RESEND_API = "https://api.resend.com/emails";
const FROM = "ETF.PLAN <hello@etfplan.app>"; // use until custom domain verified
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://etfplan.app";

// ── Base styles shared across all emails ────────────────────────────────────
const BASE = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f8f8f5; font-family: 'DM Sans', Arial, sans-serif; color: #1a1a2e; }
    .container { max-width: 580px; margin: 0 auto; padding: 32px 16px; }
    .logo { font-family: monospace; font-size: 14px; font-weight: 700; letter-spacing: 1px; color: #1a1a2e; margin-bottom: 28px; }
    .logo span { color: #00b96b; }
    .card { background: white; border-radius: 16px; padding: 32px; margin-bottom: 16px; border: 1px solid #e8e8e2; }
    .dark-card { background: #1a1a2e; border-radius: 16px; padding: 32px; margin-bottom: 16px; }
    h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 12px; }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
    p { font-size: 15px; line-height: 1.75; color: #7a7a8a; margin-bottom: 12px; }
    .btn { display: inline-block; background: #00b96b; color: white !important; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 16px rgba(0,185,107,0.3); }
    .btn-dark { display: inline-block; background: #1a1a2e; color: white !important; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; }
    .mono { font-family: monospace; }
    .muted { color: #aaaabc; font-size: 12px; }
    .green { color: #00b96b; }
    .footer { text-align: center; font-size: 12px; color: #aaaabc; line-height: 1.7; margin-top: 24px; }
    .footer a { color: #00b96b; text-decoration: none; }
    .divider { height: 1px; background: #f0f0ec; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 10px 14px; }
  </style>
`;

function unsubscribeLink(email) {
  const encoded = encodeURIComponent(email);
  return `${SITE_URL}/api/unsubscribe?email=${encoded}`;
}

function footer(email) {
  return `
    <div class="footer">
      <p>You're receiving this because you signed up at ETF.PLAN.<br>
      <a href="${unsubscribeLink(email)}">Unsubscribe</a> · 
      <a href="${SITE_URL}/dashboard">View your dashboard</a> · 
      <a href="${SITE_URL}">ETF.PLAN</a></p>
      <p style="margin-top:8px;">Not financial advice. Past performance ≠ future results.</p>
    </div>
  `;
}

// ── Send function ────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Email send failed");
  return data;
}

// ── 1. Confirmation email (replaces Supabase default) ────────────────────────
export async function sendConfirmationEmail({ email, confirmUrl }) {
  const html = `<!DOCTYPE html><html><head>${BASE}</head><body>
    <div class="container">
      <div class="logo">ETF<span>.</span>PLAN</div>
      <div class="dark-card">
        <h1 style="color:white;">One click to confirm your account 📧</h1>
        <p style="color:rgba(255,255,255,0.55);">You're almost there. Click the button below to verify your email and access your personalised ETF saving plan.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${confirmUrl}" class="btn">Confirm my email →</a>
        </div>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;">Link expires in 24 hours. If you didn't sign up for ETF.PLAN, ignore this email.</p>
      </div>
      <div class="card">
        <h2>What is ETF.PLAN?</h2>
        <p>We build your personalised monthly ETF investment plan based on real market data. Pick $50, $100 or $150/month — we tell you exactly what to buy.</p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;">
          ${["📊 Real market data, updated daily","🛡️ Conservative to Aggressive plans","📅 Monthly reminders to invest"].map(s=>`<div style="font-size:13px;color:#7a7a8a;">${s}</div>`).join("")}
        </div>
      </div>
      ${footer(email)}
    </div>
  </body></html>`;

  return sendEmail({
    to: email,
    subject: "Confirm your ETF.PLAN account ✓",
    html,
  });
}

// ── 2. Welcome email (after onboarding complete) ─────────────────────────────
export async function sendWelcomeEmail({ email, name, profile, amount, tickers, allocations }) {
  const profileMeta = {
    conservative: { icon:"🛡️", label:"Conservative", rate:"~5%/yr", color:"#3b82f6" },
    balanced:     { icon:"⚖️", label:"Balanced",     rate:"~9%/yr", color:"#c9a84c" },
    aggressive:   { icon:"🚀", label:"Aggressive",   rate:"~16%/yr",color:"#ff4757" },
  }[profile] || { icon:"⚖️", label:"Balanced", rate:"~9%/yr", color:"#c9a84c" };

  const monthLabel = new Date().toLocaleDateString("en-US", { month:"long", year:"numeric" });
  const etfRows = (tickers || []).map(t => {
    const pct     = allocations?.[t] || 25;
    const dollars = Math.round(amount * pct / 100);
    return `<tr style="border-bottom:1px solid #f0f0ec;">
      <td style="padding:10px 14px;font-family:monospace;font-weight:700;color:#1a1a2e;">${t}</td>
      <td style="padding:10px 14px;color:#7a7a8a;font-family:monospace;">${pct}%</td>
      <td style="padding:10px 14px;font-weight:700;font-family:monospace;color:#00b96b;text-align:right;">$${dollars}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head>${BASE}</head><body>
    <div class="container">
      <div class="logo">ETF<span>.</span>PLAN</div>

      <div class="dark-card">
        <p class="mono" style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:10px;">YOUR PLAN IS LIVE</p>
        <h1 style="color:white;">Welcome aboard, ${name}! ${profileMeta.icon}</h1>
        <p style="color:rgba(255,255,255,0.55);margin-bottom:20px;">Your <strong style="color:white;">${profileMeta.label} plan</strong> is set up and ready. Here's what to buy this month to get started.</p>

        <table style="background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-bottom:16px;">
          <thead>
            <tr style="background:rgba(255,255,255,0.1);">
              <th style="padding:10px 14px;text-align:left;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);font-weight:400;letter-spacing:1px;">ETF</th>
              <th style="padding:10px 14px;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);font-weight:400;letter-spacing:1px;">ALLOC</th>
              <th style="padding:10px 14px;text-align:right;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);font-weight:400;letter-spacing:1px;">BUY</th>
            </tr>
          </thead>
          <tbody style="color:white;">${etfRows}
            <tr>
              <td colspan="2" style="padding:12px 14px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.35);">TOTAL — ${monthLabel}</td>
              <td style="padding:12px 14px;text-align:right;font-family:monospace;font-weight:700;font-size:16px;color:white;">$${amount}</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align:center;">
          <a href="${SITE_URL}/dashboard" class="btn">Go to my dashboard →</a>
        </div>
      </div>

      <div class="card">
        <h2>How it works each month</h2>
        ${["On the 1st of the month you'll get an email with that month's ETF picks","Open your broker (Robinhood, eToro, Vanguard) and buy the amounts listed","Come back to your dashboard to track your real portfolio growth","Our engine re-scores ETFs daily and updates picks based on market momentum"].map((s,i)=>`
          <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
            <div style="width:24px;height:24px;border-radius:50%;background:#00b96b;color:white;font-family:monospace;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:700;">${i+1}</div>
            <p style="margin:0;padding-top:3px;">${s}</p>
          </div>`).join("")}
      </div>

      ${footer(email)}
    </div>
  </body></html>`;

  return sendEmail({
    to: email,
    subject: `Your ${profileMeta.label} ETF plan is live — here's what to buy first 🚀`,
    html,
  });
}

// ── 3. Monthly reminder email ────────────────────────────────────────────────
export async function sendMonthlyReminder({ email, name, profile, amount, tickers, allocations, monthLabel }) {
  const profileMeta = {
    conservative: { icon:"🛡️", label:"Conservative", rate:"~5%/yr" },
    balanced:     { icon:"⚖️", label:"Balanced",     rate:"~9%/yr" },
    aggressive:   { icon:"🚀", label:"Aggressive",   rate:"~16%/yr" },
  }[profile] || { icon:"⚖️", label:"Balanced", rate:"~9%/yr" };

  const etfRows = (tickers || []).map(t => {
    const pct     = allocations?.[t] || 25;
    const dollars = Math.round(amount * pct / 100);
    return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
      <td style="padding:12px 14px;font-family:monospace;font-weight:700;color:white;">${t}</td>
      <td style="padding:12px 14px;font-family:monospace;color:rgba(255,255,255,0.4);">${pct}%</td>
      <td style="padding:12px 14px;text-align:right;font-family:monospace;font-weight:700;color:#00ff88;">$${dollars}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head>${BASE}</head><body>
    <div class="container">
      <div class="logo">ETF<span>.</span>PLAN</div>

      <div class="dark-card">
        <p class="mono" style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:10px;">${monthLabel.toUpperCase()} · ${profileMeta.icon} ${profileMeta.label.toUpperCase()} PLAN</p>
        <h1 style="color:white;">Time to invest this month, ${name}!</h1>
        <p style="color:rgba(255,255,255,0.55);">Your monthly picks are ready. Buy these ETFs to stay on track with your <strong style="color:white;">${profileMeta.rate} target</strong>.</p>

        <table style="background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin:20px 0;">
          <thead>
            <tr style="background:rgba(255,255,255,0.1);">
              <th style="padding:10px 14px;text-align:left;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);font-weight:400;">ETF</th>
              <th style="padding:10px 14px;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);font-weight:400;">ALLOC</th>
              <th style="padding:10px 14px;text-align:right;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);font-weight:400;">BUY</th>
            </tr>
          </thead>
          <tbody>${etfRows}
            <tr>
              <td colspan="2" style="padding:12px 14px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.3);">TOTAL THIS MONTH</td>
              <td style="padding:12px 14px;text-align:right;font-family:monospace;font-weight:700;font-size:16px;color:white;">$${amount}</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align:center;">
          <a href="${SITE_URL}/dashboard" class="btn">View full plan →</a>
        </div>
      </div>

      <div class="card" style="background:#f8f8f5;border:1px solid #e8e8e2;">
        <h2 style="font-size:14px;">How to invest</h2>
        ${["Open your broker app (Robinhood, eToro, Vanguard, etc.)","Search each ticker and buy the listed dollar amount","Come back to your dashboard to track your results"].map((s,i)=>`
          <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;">
            <div style="width:20px;height:20px;border-radius:50%;background:#00b96b;color:white;font-size:10px;font-family:monospace;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
            <p style="margin:0;font-size:13px;padding-top:2px;">${s}</p>
          </div>`).join("")}
      </div>

      ${footer(email)}
    </div>
  </body></html>`;

  return sendEmail({
    to: email,
    subject: `⏰ ${monthLabel} — your ETF picks are ready`,
    html,
  });
}

// ── 4. Newsletter ────────────────────────────────────────────────────────────
export async function sendNewsletter({ email, name, subject, headline, body, ctaText, ctaUrl, rawHtml }) {
  // If rawHtml is provided, send it directly without wrapping
  if (rawHtml) {
    // Replace {{email}} placeholder with actual email for unsubscribe link
    const html = rawHtml.replace(/\{\{email\}\}/g, encodeURIComponent(email));
    return sendEmail({ to: email, subject, html });
  }

  const html = `<!DOCTYPE html><html><head>${BASE}</head><body>
    <div class="container">
      <div class="logo">ETF<span>.</span>PLAN</div>

      <div class="dark-card">
        <p class="mono" style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:10px;">
          ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}).toUpperCase()}
        </p>
        <h1 style="color:white;">${headline}</h1>
      </div>

      <div class="card">
        ${body}
        ${ctaText && ctaUrl ? `<div style="text-align:center;margin-top:20px;"><a href="${ctaUrl}" class="btn">${ctaText}</a></div>` : ""}
      </div>

      ${footer(email)}
    </div>
  </body></html>`;

  return sendEmail({ to: email, subject, html });
}

// ── Day 3 — "Did you buy your ETFs?" ─────────────────────────────────────────
export async function sendDay3Email({ email, name, profile, amount, tickers, allocations }) {
  const planLabels = { conservative:"Conservative 🛡️", balanced:"Balanced ⚖️", aggressive:"Aggressive 🚀" };
  const profileLabel = planLabels[profile] || profile;

  const etfRows = tickers.map(t => {
    const pct = allocations?.[t] || Math.floor(100/tickers.length);
    const dollars = Math.round(amount * pct / 100);
    return `<tr><td style="padding:10px 14px;font-family:monospace;font-size:14px;color:#00b96b;font-weight:600">${t}</td><td style="padding:10px 14px;font-family:monospace;font-size:13px;color:#1a1a2e">$${dollars}</td><td style="padding:10px 14px;font-size:13px;color:#7a7a8a">${pct}% of your $${amount}</td></tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head>${BASE}</head><body><div class="container">
    <div class="logo">ETF<span>.</span>PLAN</div>
    <div class="dark-card">
      <p class="mono" style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:10px;">QUICK CHECK-IN</p>
      <h1 style="color:white;">Hey ${name} — did you buy your ETFs? 👀</h1>
      <p style="color:rgba(255,255,255,0.55);">3 days ago you set up your ${profileLabel} plan. The sooner you make your first purchase, the sooner your money starts compounding.</p>
    </div>
    <div class="card">
      <h2>Your ${profileLabel} plan for this month:</h2>
      <p style="margin-bottom:16px;">Here's exactly what to buy on your broker app:</p>
      <table style="background:#f8f8f5;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <tr style="background:#1a1a2e;"><th style="text-align:left;padding:10px 14px;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;">ETF</th><th style="text-align:left;padding:10px 14px;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;">AMOUNT</th><th style="text-align:left;padding:10px 14px;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;">ALLOCATION</th></tr>
        ${etfRows}
      </table>
      <p style="font-size:13px;color:#7a7a8a;margin-bottom:20px;">Takes less than 5 minutes on Robinhood, eToro or Interactive Brokers. Once bought, come back and mark them as bought in your dashboard.</p>
      <div style="text-align:center;"><a href="${SITE_URL}/dashboard" class="btn">Go to my dashboard →</a></div>
    </div>
    <div class="card" style="background:#f8f8f5;border:none;">
      <p style="font-size:13px;color:#7a7a8a;text-align:center;margin:0;">💡 <strong>Don't have a broker yet?</strong> <a href="${SITE_URL}/guide/platforms" style="color:#00b96b;">See our recommended platforms</a> — all free to open.</p>
    </div>
    ${footer(email)}
  </div></body></html>`;

  return sendEmail({ to: email, subject: `${name}, did you buy your ETFs yet? 👀`, html });
}

// ── Day 7 — "Your first week + what's compounding" ───────────────────────────
export async function sendDay7Email({ email, name, profile, amount }) {
  const annualPassive = {
    conservative: { y5: 342, y10: 877 },
    balanced:     { y5: 684, y10: 1755 },
    aggressive:   { y5: 1026, y10: 2632 },
  }[profile] || { y5: 684, y10: 1755 };

  const html = `<!DOCTYPE html><html><head>${BASE}</head><body><div class="container">
    <div class="logo">ETF<span>.</span>PLAN</div>
    <div class="dark-card">
      <p class="mono" style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:10px;">ONE WEEK IN</p>
      <h1 style="color:white;">One week in. Here's what's happening with your money 📈</h1>
    </div>
    <div class="card">
      <h2>The math nobody shows you</h2>
      <p>You're investing $${amount}/month. Here's what that actually means over time:</p>
      <div style="display:grid;gap:10px;margin:20px 0;">
        <div style="background:#f8f8f5;border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e8e8e2;">
          <div><div style="font-family:monospace;font-size:10px;color:#aaaabc;margin-bottom:4px;">AFTER 5 YEARS</div><div style="font-size:13px;color:#7a7a8a;">$${(amount*60).toLocaleString()} invested</div></div>
          <div style="text-align:right;"><div style="font-family:monospace;font-size:10px;color:#aaaabc;margin-bottom:4px;">GENERATES ANNUALLY</div><div style="font-family:monospace;font-size:22px;font-weight:700;color:#00b96b;">+$${annualPassive.y5.toLocaleString()}/yr</div></div>
        </div>
        <div style="background:#1a1a2e;border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-family:monospace;font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:4px;">AFTER 10 YEARS</div><div style="font-size:13px;color:rgba(255,255,255,0.5);">$${(amount*120).toLocaleString()} invested</div></div>
          <div style="text-align:right;"><div style="font-family:monospace;font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:4px;">GENERATES ANNUALLY</div><div style="font-family:monospace;font-size:22px;font-weight:700;color:#00b96b;">+$${annualPassive.y10.toLocaleString()}/yr</div></div>
        </div>
      </div>
      <p style="font-size:13px;background:rgba(0,185,107,0.06);border:1px solid rgba(0,185,107,0.2);border-radius:10px;padding:12px;color:#1a1a2e;">
        💡 That +$${annualPassive.y10.toLocaleString()}/yr at year 10 means your portfolio is paying for your phone bill, car insurance, and all your subscriptions — <strong>every year, automatically</strong>.
      </p>
    </div>
    <div class="card">
      <h2>The one thing you need to do</h2>
      <p>Every 1st of the month, we send you exactly which ETFs to buy that month. You spend 5 minutes, execute the trades, and come back to mark them as bought in your dashboard.</p>
      <p>That's it. The rest is time.</p>
      <div style="text-align:center;margin-top:20px;"><a href="${SITE_URL}/dashboard" class="btn">View my dashboard →</a></div>
    </div>
    ${footer(email)}
  </div></body></html>`;

  return sendEmail({ to: email, subject: `The math that will change how you think about $${amount}/month`, html });
}

// ── Day 30 — "Your first month complete" ─────────────────────────────────────
export async function sendDay30Email({ email, name, profile, amount }) {
  const html = `<!DOCTYPE html><html><head>${BASE}</head><body><div class="container">
    <div class="logo">ETF<span>.</span>PLAN</div>
    <div class="dark-card">
      <p class="mono" style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:10px;">ONE MONTH MILESTONE</p>
      <h1 style="color:white;">You've been at this for a month. 🎉</h1>
      <p style="color:rgba(255,255,255,0.55);">Most people talk about investing. You started. That alone puts you ahead of the majority.</p>
    </div>
    <div class="card">
      <h2>This month's ETF picks are ready</h2>
      <p>Head to your dashboard to see this month's recommended ETFs, amounts, and to track what you buy.</p>
      <div style="text-align:center;margin:20px 0;"><a href="${SITE_URL}/dashboard" class="btn">See this month's picks →</a></div>
    </div>
    <div class="card" style="background:#f8f8f5;border:1px solid #e8e8e2;">
      <h2>A reminder of why you started</h2>
      <p style="margin-bottom:0;">You're building a machine that pays you. Every month you invest, the machine gets stronger. In a few years it starts paying your bills. In ten years it pays your salary. Keep going.</p>
    </div>
    ${footer(email)}
  </div></body></html>`;

  return sendEmail({ to: email, subject: `One month in, ${name} — your picks for this month are ready`, html });
}
