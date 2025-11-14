# Test Accounts for Talent Nigeria

## Account Credentials

All test accounts use the password: **TestPass123!**

---

## CANDIDATE ACCOUNTS

### 1. Free Plan (candidate-free)
- **Email:** candidate.free@test.com
- **Password:** TestPass123!
- **Plan:** Free (₦0/month)
- **Features:** 
  - Create profile
  - Browse jobs
  - Apply to 3-5 postings per month
  - Basic visibility

### 2. Basic Plan (candidate-basic)
- **Email:** candidate.basic@test.com
- **Password:** TestPass123!
- **Plan:** Basic (₦12,000/month)
- **Features:**
  - Unlimited job board access
  - Apply to all postings
  - Featured profile
  - Email and dashboard alerts

### 3. Pro Plan (candidate-pro)
- **Email:** candidate.pro@test.com
- **Password:** TestPass123!
- **Plan:** Pro (₦30,000/month)
- **Features:**
  - Everything in Basic
  - AI job match suggestions
  - Resume review & optimization
  - Portfolio upload
  - Priority applications
  - Verified talent badge eligibility

### 4. Elite/Vetted Plan (candidate-elite)
- **Email:** candidate.elite@test.com
- **Password:** TestPass123!
- **Plan:** Elite/Vetted (₦120,000 one-time)
- **Features:**
  - Live assessment + interview
  - Verified badge shown to employers
  - Boosted profile
  - Invitation to premium job listings
  - Employer direct outreach

---

## EMPLOYER ACCOUNTS

### 1. Starter Plan (employer-starter)
- **Email:** employer.starter@test.com
- **Password:** TestPass123!
- **Plan:** Starter (₦40,000/month)
- **Features:**
  - Up to 3 active job posts
  - View full candidate profiles
  - Basic applicant support
  - Contact and update applicants

### 2. Growth Plan (employer-growth)
- **Email:** employer.growth@test.com
- **Password:** TestPass123!
- **Plan:** Growth (₦180,000/month)
- **Features:**
  - Up to 15 job posts
  - Curated applicant shortlist (3-5 vetted candidates/month)
  - Boosted job visibility
  - Priority email support

### 3. Scale Plan (employer-scale)
- **Email:** employer.scale@test.com
- **Password:** TestPass123!
- **Plan:** Scale (₦500,000/month)
- **Features:**
  - Unlimited job posts
  - 3 curated shortlists per month
  - Featured job positions
  - Priority employer support
  - Employer branding page

### 4. Enterprise Plan (employer-enterprise)
- **Email:** employer.enterprise@test.com
- **Password:** TestPass123!
- **Plan:** Enterprise (₦750,000/month)
- **Features:**
  - Dedicated account manager
  - Full sourcing and vetting support
  - Optional payroll integration
  - SLA guarantee
  - Replacement guarantee for hires

---

## Setup Instructions

### Manual Setup (Recommended for Testing)

1. **Sign Up Each Account:**
   - Go to `/auth` on your application
   - Click "Sign Up" tab
   - Select the appropriate user type (Candidate or Employer)
   - Use the email and password from above
   - Complete signup

2. **Configure Subscriptions:**
   The subscription records have been pre-created in the database. Once you sign up with these emails, the system will automatically associate them with their respective plans.

### Quick SQL Setup (Alternative)

If you need to quickly set up profile data after creating the accounts, run this SQL:

```sql
-- Update candidate profiles
UPDATE profiles 
SET 
  user_type = 'candidate',
  subscription_status = 'active',
  full_name = CASE 
    WHEN email = 'candidate.free@test.com' THEN 'Free Candidate'
    WHEN email = 'candidate.basic@test.com' THEN 'Basic Candidate'
    WHEN email = 'candidate.pro@test.com' THEN 'Pro Candidate'
    WHEN email = 'candidate.elite@test.com' THEN 'Elite Candidate'
  END,
  onboarding_completed = true
WHERE email LIKE 'candidate%@test.com';

-- Update employer profiles
UPDATE profiles 
SET 
  user_type = 'employer',
  subscription_status = 'active',
  full_name = CASE 
    WHEN email = 'employer.starter@test.com' THEN 'Starter Company'
    WHEN email = 'employer.growth@test.com' THEN 'Growth Company'
    WHEN email = 'employer.scale@test.com' THEN 'Scale Company'
    WHEN email = 'employer.enterprise@test.com' THEN 'Enterprise Company'
  END,
  company_name = CASE 
    WHEN email = 'employer.starter@test.com' THEN 'Starter Company Ltd'
    WHEN email = 'employer.growth@test.com' THEN 'Growth Tech Ltd'
    WHEN email = 'employer.scale@test.com' THEN 'Scale Enterprises'
    WHEN email = 'employer.enterprise@test.com' THEN 'Enterprise Corporation'
  END,
  onboarding_completed = true
WHERE email LIKE 'employer%@test.com';
```

---

## Testing Checklist

### Candidate Accounts
- [ ] Free: Can only apply to 5 jobs per month
- [ ] Basic: Unlimited applications, featured profile
- [ ] Pro: AI matching, resume review features
- [ ] Elite: Has verified badge, boosted visibility

### Employer Accounts
- [ ] Starter: Limited to 3 active job posts
- [ ] Growth: Can post up to 15 jobs, gets curated shortlists
- [ ] Scale: Unlimited posts, featured positions
- [ ] Enterprise: Full support, dedicated manager features

---

## Notes

- All accounts are pre-configured with active subscriptions
- Subscription periods are set to 30 days from creation
- The Elite plan is marked as a one-time payment
- Employer accounts have job post limits based on their plans
- Make sure to disable email confirmation in Supabase for testing (Settings > Authentication > Email > Disable email confirmation)

---

## Support

If you encounter any issues with these test accounts:
1. Check that email confirmation is disabled in Supabase
2. Verify the subscription records exist in the database
3. Ensure user_type is set correctly on the profiles table
4. Check that RLS policies allow the operations you're testing