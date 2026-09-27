# Mariam Academy — Real Version

## 1) Vercel Environment Variables
Keep these in Vercel Production:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Do NOT put the Supabase secret key in the browser or in NEXT_PUBLIC_* variables.

## 2) Supabase database
Open Supabase > SQL Editor and run `supabase/schema.sql`.

## 3) Create Mariam's account
Create the account from the website using the email/password you want for Mariam.
Then open Supabase > Authentication > Users, copy Mariam's User ID (UUID).
In SQL Editor run:
update public.profiles set role = 'admin' where id = 'PASTE_MARIAM_USER_ID_HERE';

## 4) Deploy
Upload this project folder to the same Vercel project and deploy.
The app will use the two environment variables already configured.

## Included now
- Real Supabase email/password signup/login
- Student profile creation
- Admin role
- Dynamic published courses
- Admin course creation
- Arabic / English interface switch
- Responsive mobile design

Next stage
- Course details
- Video lessons
- PDF/material uploads
- Student enrollment/access control
- Exams and results
- Better admin dashboard


## Current database note
The app is configured for the existing Supabase schema where the teacher role is `teacher` and courses use `title_ar`, `title_en`, `description_ar`, `description_en`, and `is_published`.
