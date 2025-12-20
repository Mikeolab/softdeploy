/**
 * Lead Automation System - Google Apps Script
 * 
 * Features:
 * - Auto-generates personalized email drafts
 * - Schedules follow-ups automatically
 * - Sends daily reminder emails
 * - Tracks lead status
 */

// CONFIGURATION - EDIT THESE
const CONFIG = {
  YOUR_NAME: 'Mike',
  YOUR_EMAIL: 'mikeolab@gmail.com',
  CALENDLY_LINK: 'https://calendly.com/softdeployautomation',
  AUDIT_PRICE_USD: '$49',
  AUDIT_PRICE_NGN: '₦15,000',
  SHEET_NAME: 'LeadEngine',
  SEND_LIMIT_PER_DAY: 30 // Safety limit
};

// Email Templates
const EMAIL_TEMPLATES = {
  initial: {
    subject: (businessName) => `Quick automation audit for ${businessName}`,
    body: (lead) => {
      const price = lead.country === 'Nigeria' ? CONFIG.AUDIT_PRICE_NGN : CONFIG.AUDIT_PRICE_USD;
      return `Hi ${lead.contactName || 'there'},

Quick one — I help local service businesses stop losing leads with automated missed-call + SMS/WhatsApp follow-up + booking systems.

I noticed ${lead.businessName} could benefit from instant lead replies and automated follow-up sequences.

I'm offering a ${price} Automation Audit (30 mins) where you get:
• A 1-page plan showing exactly what to automate
• The exact messages/sequences to use
• ROI estimate for your business

Want me to send a 2-minute video showing how it would work for ${lead.businessName}?

Best,
${CONFIG.YOUR_NAME}

P.S. If you book the audit and want me to build it, the ${price} is deducted from setup cost.`;
    }
  },
  followUp1: {
    subject: (businessName) => `Re: Automation audit for ${businessName}`,
    body: (lead) => {
      const price = lead.country === 'Nigeria' ? CONFIG.AUDIT_PRICE_NGN : CONFIG.AUDIT_PRICE_USD;
      return `Hi ${lead.contactName || 'there'},

Just checking — should I send the 2-minute automation audit video for ${lead.businessName}?

It shows exactly how missed-call → SMS/WhatsApp → booking automation would work for your business.

The ${price} audit takes 30 mins and you get a complete plan.

Let me know if you want it.

Best,
${CONFIG.YOUR_NAME}`;
    }
  },
  followUp2: {
    subject: (businessName) => `Quick follow-up: ${businessName}`,
    body: (lead) => {
      const price = lead.country === 'Nigeria' ? CONFIG.AUDIT_PRICE_NGN : CONFIG.AUDIT_PRICE_USD;
      return `Hi ${lead.contactName || 'there'},

No worries if now isn't the right time.

If you want, I can still map the missed-call + follow-up automation flow for ${lead.businessName} and send it over (${price} audit).

Just reply "yes" and I'll send the video + plan.

Best,
${CONFIG.YOUR_NAME}`;
    }
  },
  followUp3: {
    subject: (businessName) => `Last ping: ${businessName}`,
    body: (lead) => {
      const price = lead.country === 'Nigeria' ? CONFIG.AUDIT_PRICE_NGN : CONFIG.AUDIT_PRICE_USD;
      return `Hi ${lead.contactName || 'there'},

Last ping — want the ${price} automation audit slot this week, or should I close your file?

If you're interested, reply and I'll send the 2-minute video + plan.

Best,
${CONFIG.YOUR_NAME}`;
    }
  }
};

/**
 * Main function: Generate email drafts for new leads
 * Run this manually or set up a daily trigger
 */
function generateEmailDrafts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    Logger.log('Sheet not found. Make sure it\'s named "LeadEngine"');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const colIndices = {
    businessName: headers.indexOf('BusinessName'),
    email: headers.indexOf('Email'),
    country: headers.indexOf('Country'),
    city: headers.indexOf('City'),
    niche: headers.indexOf('Niche'),
    contactName: headers.indexOf('ContactName'),
    status: headers.indexOf('Status'),
    message1Sent: headers.indexOf('Message1Sent'),
    followUp1Sent: headers.indexOf('FollowUp1Sent'),
    followUp2Sent: headers.indexOf('FollowUp2Sent'),
    followUp3Sent: headers.indexOf('FollowUp3Sent'),
    emailDraftLink: headers.indexOf('EmailDraftLink')
  };

  let draftsCreated = 0;
  const today = new Date();
  const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Process rows (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[colIndices.status];
    const email = row[colIndices.email];
    
    // Skip if no email or already processed
    if (!email || status === 'Closed' || status === 'Booked') continue;

    const lead = {
      businessName: row[colIndices.businessName] || 'Business',
      email: email,
      country: row[colIndices.country] || 'US',
      city: row[colIndices.city] || '',
      niche: row[colIndices.niche] || '',
      contactName: row[colIndices.contactName] || ''
    };

    // Generate initial draft if not sent
    if (status === 'New' && !row[colIndices.message1Sent]) {
      const draft = createEmailDraft(lead, 'initial');
      if (draft) {
        sheet.getRange(i + 1, colIndices.emailDraftLink + 1).setValue(draft.getMessage().getThread().getPermalink());
        sheet.getRange(i + 1, colIndices.status + 1).setValue('Drafted');
        draftsCreated++;
      }
    }
  }

  Logger.log(`Created ${draftsCreated} email drafts`);
  return draftsCreated;
}

/**
 * Create email draft in Gmail
 */
function createEmailDraft(lead, templateType) {
  try {
    const template = EMAIL_TEMPLATES[templateType];
    const subject = template.subject(lead.businessName);
    const body = template.body(lead);

    const draft = GmailApp.createDraft(
      lead.email,
      subject,
      body
    );

    return draft;
  } catch (error) {
    Logger.log(`Error creating draft for ${lead.email}: ${error}`);
    return null;
  }
}

/**
 * Check and schedule follow-ups
 * Run this daily (set up time-driven trigger)
 */
function scheduleFollowUps() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colIndices = {
    email: headers.indexOf('Email'),
    status: headers.indexOf('Status'),
    lastContacted: headers.indexOf('LastContactedDate'),
    nextFollowUp: headers.indexOf('NextFollowUpDate'),
    message1Sent: headers.indexOf('Message1Sent'),
    followUp1Sent: headers.indexOf('FollowUp1Sent'),
    followUp2Sent: headers.indexOf('FollowUp2Sent'),
    followUp3Sent: headers.indexOf('FollowUp3Sent'),
    businessName: headers.indexOf('BusinessName'),
    country: headers.indexOf('Country'),
    city: headers.indexOf('City'),
    niche: headers.indexOf('Niche'),
    contactName: headers.indexOf('ContactName')
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[colIndices.email];
    const status = row[colIndices.status];
    const nextFollowUp = row[colIndices.nextFollowUp];
    
    if (!email || status === 'Closed' || status === 'Booked') continue;

    const lastContacted = row[colIndices.lastContacted] ? new Date(row[colIndices.lastContacted]) : null;
    const daysSinceContact = lastContacted ? Math.floor((today - lastContacted) / (1000 * 60 * 60 * 24)) : 999;

    // Schedule follow-up 1 (Day 2)
    if (row[colIndices.message1Sent] && !row[colIndices.followUp1Sent] && daysSinceContact >= 2) {
      const followUpDate = new Date(lastContacted);
      followUpDate.setDate(followUpDate.getDate() + 2);
      sheet.getRange(i + 1, colIndices.nextFollowUp + 1).setValue(followUpDate);
    }

    // Schedule follow-up 2 (Day 4)
    if (row[colIndices.followUp1Sent] && !row[colIndices.followUp2Sent] && daysSinceContact >= 4) {
      const followUpDate = new Date(lastContacted);
      followUpDate.setDate(followUpDate.getDate() + 4);
      sheet.getRange(i + 1, colIndices.nextFollowUp + 1).setValue(followUpDate);
    }

    // Schedule follow-up 3 (Day 7)
    if (row[colIndices.followUp2Sent] && !row[colIndices.followUp3Sent] && daysSinceContact >= 7) {
      const followUpDate = new Date(lastContacted);
      followUpDate.setDate(followUpDate.getDate() + 7);
      sheet.getRange(i + 1, colIndices.nextFollowUp + 1).setValue(followUpDate);
    }
  }
}

/**
 * Generate follow-up drafts for today
 * Run this daily
 */
function generateFollowUpDrafts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colIndices = {
    email: headers.indexOf('Email'),
    status: headers.indexOf('Status'),
    nextFollowUp: headers.indexOf('NextFollowUpDate'),
    message1Sent: headers.indexOf('Message1Sent'),
    followUp1Sent: headers.indexOf('FollowUp1Sent'),
    followUp2Sent: headers.indexOf('FollowUp2Sent'),
    followUp3Sent: headers.indexOf('FollowUp3Sent'),
    businessName: headers.indexOf('BusinessName'),
    country: headers.indexOf('Country'),
    city: headers.indexOf('City'),
    niche: headers.indexOf('Niche'),
    contactName: headers.indexOf('ContactName'),
    emailDraftLink: headers.indexOf('EmailDraftLink')
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let draftsCreated = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[colIndices.email];
    const status = row[colIndices.status];
    const nextFollowUp = row[colIndices.nextFollowUp] ? new Date(row[colIndices.nextFollowUp]) : null;
    
    if (!email || status === 'Closed' || status === 'Booked' || !nextFollowUp) continue;

    nextFollowUp.setHours(0, 0, 0, 0);
    if (nextFollowUp.getTime() !== today.getTime()) continue;

    const lead = {
      businessName: row[colIndices.businessName] || 'Business',
      email: email,
      country: row[colIndices.country] || 'US',
      city: row[colIndices.city] || '',
      niche: row[colIndices.niche] || '',
      contactName: row[colIndices.contactName] || ''
    };

    let templateType = null;
    if (row[colIndices.message1Sent] && !row[colIndices.followUp1Sent]) {
      templateType = 'followUp1';
    } else if (row[colIndices.followUp1Sent] && !row[colIndices.followUp2Sent]) {
      templateType = 'followUp2';
    } else if (row[colIndices.followUp2Sent] && !row[colIndices.followUp3Sent]) {
      templateType = 'followUp3';
    }

    if (templateType) {
      const draft = createEmailDraft(lead, templateType);
      if (draft) {
        sheet.getRange(i + 1, colIndices.emailDraftLink + 1).setValue(draft.getMessage().getThread().getPermalink());
        draftsCreated++;
      }
    }
  }

  Logger.log(`Created ${draftsCreated} follow-up drafts`);
  return draftsCreated;
}

/**
 * Send daily reminder email with follow-up list
 * Run this daily at 9 AM
 */
function sendDailyReminder() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colIndices = {
    businessName: headers.indexOf('BusinessName'),
    email: headers.indexOf('Email'),
    nextFollowUp: headers.indexOf('NextFollowUpDate'),
    status: headers.indexOf('Status'),
    emailDraftLink: headers.indexOf('EmailDraftLink')
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpsToday = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const nextFollowUp = row[colIndices.nextFollowUp] ? new Date(row[colIndices.nextFollowUp]) : null;
    const status = row[colIndices.status];
    
    if (!nextFollowUp || status === 'Closed' || status === 'Booked') continue;

    nextFollowUp.setHours(0, 0, 0, 0);
    if (nextFollowUp.getTime() === today.getTime()) {
      followUpsToday.push({
        business: row[colIndices.businessName],
        email: row[colIndices.email],
        draftLink: row[colIndices.emailDraftLink] || 'No draft yet'
      });
    }
  }

  if (followUpsToday.length === 0) {
    Logger.log('No follow-ups scheduled for today');
    return;
  }

  // Send reminder email
  const subject = `📧 ${followUpsToday.length} Follow-ups Due Today`;
  let body = `Hi ${CONFIG.YOUR_NAME},\n\nYou have ${followUpsToday.length} follow-up(s) scheduled for today:\n\n`;
  
  followUpsToday.forEach((item, index) => {
    body += `${index + 1}. ${item.business} (${item.email})\n`;
    if (item.draftLink && item.draftLink !== 'No draft yet') {
      body += `   Draft: ${item.draftLink}\n`;
    }
    body += '\n';
  });

  body += `\nTotal leads in pipeline: ${data.length - 1}\n`;
  body += `\n---\nThis is an automated reminder from your Lead Automation System.`;

  GmailApp.sendEmail(CONFIG.YOUR_EMAIL, subject, body);
  Logger.log(`Sent reminder email with ${followUpsToday.length} follow-ups`);
}

/**
 * Mark email as sent (call this manually after you send an email)
 * Or set up a Gmail filter to auto-update status
 */
function markEmailSent(email, messageType) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('Email');
  const statusCol = headers.indexOf('Status');
  const lastContactedCol = headers.indexOf('LastContactedDate');
  
  const messageCols = {
    'initial': headers.indexOf('Message1Sent'),
    'followUp1': headers.indexOf('FollowUp1Sent'),
    'followUp2': headers.indexOf('FollowUp2Sent'),
    'followUp3': headers.indexOf('FollowUp3Sent')
  };

  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol] === email) {
      const today = new Date();
      sheet.getRange(i + 1, lastContactedCol + 1).setValue(today);
      sheet.getRange(i + 1, statusCol + 1).setValue('Contacted');
      
      if (messageCols[messageType] !== -1) {
        sheet.getRange(i + 1, messageCols[messageType] + 1).setValue('Yes');
      }
      
      Logger.log(`Marked ${email} as sent (${messageType})`);
      break;
    }
  }
}

/**
 * Setup daily triggers (run this once)
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Create new triggers
  ScriptApp.newTrigger('generateFollowUpDrafts')
    .timeBased()
    .everyDays(1)
    .atHour(8) // 8 AM
    .create();

  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased()
    .everyDays(1)
    .atHour(9) // 9 AM
    .create();

  ScriptApp.newTrigger('scheduleFollowUps')
    .timeBased()
    .everyDays(1)
    .atHour(7) // 7 AM
    .create();

  Logger.log('Triggers set up successfully!');
}
