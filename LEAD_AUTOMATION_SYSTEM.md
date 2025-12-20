# Lead Automation System (Free - Google Sheets + Apps Script)

## Overview
A complete lead tracking + automated email outreach system using only free tools:
- **Google Sheets** (CRM + tracking)
- **Google Apps Script** (automation)
- **Gmail** (sending)

## Setup Instructions

### Step 1: Create the Google Sheet

1. Go to https://sheets.google.com
2. Create a new sheet called "LeadEngine"
3. Add these columns (Row 1 = headers):

```
A: BusinessName
B: Website
C: Country
D: City
E: Niche
F: ContactName
G: Email
H: Phone
I: Source
J: Status
K: DateAdded
L: LastContactedDate
M: NextFollowUpDate
N: Message1Sent
N: FollowUp1Sent
O: FollowUp2Sent
P: FollowUp3Sent
Q: Notes
R: EmailDraftLink
```

### Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any default code
3. Paste the script from `LEAD_AUTOMATION_SCRIPT.js`
4. Save (Ctrl+S / Cmd+S)
5. Click **Run** → Authorize permissions

### Step 3: Configure Your Email Templates

Edit the script to customize:
- Your name
- Your email
- Your Calendly link
- Your pricing

## How It Works

### Daily Workflow:
1. **Morning**: Add 20-30 new leads to Sheet (manual sourcing from Google Maps/Instagram)
2. **Script runs**: Auto-generates personalized email drafts in Gmail
3. **You review**: Open Gmail drafts, approve/edit, send
4. **Script tracks**: Automatically updates status + schedules follow-ups
5. **Daily reminder**: Script emails you "Today's follow-ups" list

### Automated Features:
- ✅ De-duplicates leads (checks if email already exists)
- ✅ Generates personalized first line from business name + niche
- ✅ Creates Gmail drafts automatically
- ✅ Schedules follow-ups (Day 2, Day 4, Day 7)
- ✅ Sends daily reminder email with follow-up list
- ✅ Tracks status automatically

## Usage

### Adding Leads:
Just paste into Sheet:
- BusinessName | Website | Country | City | Niche | Email

Script will auto-fill dates and generate drafts.

### Sending Emails:
1. Script creates drafts in Gmail
2. You review/edit drafts
3. Click Send
4. Script automatically updates Sheet status

### Following Up:
Script emails you daily: "Follow up with these 5 businesses today"
You click the Gmail draft links → send

## Next Steps

1. Create the Sheet (5 mins)
2. Add the Script (5 mins)
3. Test with 5 sample leads
4. Start adding real leads tomorrow
