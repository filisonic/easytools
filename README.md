# EasyHR - ATS & Recruitment Platform

A modern HR and recruitment management system built with React, TypeScript, and integrated with n8n workflows.

## Features

- 🎯 **ATS Pipeline** - Candidate tracking through hiring stages
- 📧 **Mass Email Screening** - Send screening invitations to multiple candidates
- 📋 **Interview Management** - Schedule and manage interviews
- 🔍 **AI Resume Screening** - Automated candidate evaluation
- 📊 **Analytics & Reporting** - Track recruitment metrics
- 🔗 **n8n Integration** - Automated workflows for HR processes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend Integration**: n8n workflows
- **Database**: Supabase
- **Deployment**: Netlify

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Configure these environment variables for full functionality:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Deployment

This app is configured for deployment on Netlify with automatic builds from GitHub.

## n8n Integration

The application integrates with n8n workflows for:
- Email campaigns and notifications
- Resume processing and AI screening
- Interview scheduling automation
- Candidate pipeline management

Webhook endpoint: `https://n8n-railway-production-369c.up.railway.app`