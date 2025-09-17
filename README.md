# Invoicerly — Invoice Generator

A modern, responsive invoice generator built with Next.js 15, Tailwind CSS, and Framer Motion.

## Features

- Next.js 15 with App Router
- Tailwind CSS v4 for styling
- Framer Motion animations
- Responsive design for all devices
- TypeScript for type safety
- Modular components for reusability

## Tech Stack

- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- Language: TypeScript
- Icons: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd invoicegen
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## Project Structure

```
src/
  app/                    # Next.js App Router
    globals.css           # Global styles
    layout.tsx            # Root layout
    page.tsx              # Home page
    generator/page.tsx    # Invoice generator page
  components/             # React components
    demo/                 # Demo-related components
    layout/               # Layout components
    sections/             # Page sections
    ui/                   # Reusable UI components
    index.ts              # Component exports
  lib/                    # Utilities and data
    data.ts               # Static data
    theme.ts              # Theme configuration
  types/                  # TypeScript type definitions
    index.ts              # Type exports
```

## Components

### UI Components
- `Button` — Animated button with variants
- `Input` — Form input with validation
- `Textarea` — Textarea with animations
- `Card` — Container with hover effects

### Layout Components
- `Header` — Navigation header
- `Footer` — Site footer
- `Section` — Page section wrapper

### Section Components
- `Hero` — Landing page hero section
- `WhyUs` — Features showcase
- `Pricing` — Pricing plans
- `Testimonials` — Customer testimonials
- `Contact` — Contact form
- `TrustedBy` — Trust indicators
- `TemplatesGallery` — Template showcase

### Demo Components
- `DemoPreview` — Demo container with live preview
- `InvoiceForm` — Static invoice form example (read-only)
- `InvoicePaper` — Live invoice preview
- `ItemRow` — Invoice line item display component

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Customization

### Theme
Edit `src/lib/theme.ts` to customize colors and styling.

### Data
Update `src/lib/data.ts` to modify pricing plans, testimonials, and features.

### Components
All components are modular and can be easily customized or extended.

## Deployment

The app can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway

## OpenAI Setup

This project integrates OpenAI for text generation and file management.

### 1) Environment variables

Copy `env.example` to `.env.local` and set at least:

```
OPENAI_API_KEY=sk-...
# optional overrides
OPENAI_MODEL=gpt-4o-mini
OPENAI_ORG=
OPENAI_BASE_URL=
```

For production (e.g. Vercel), set the same variables in Project → Settings → Environment.

### 2) Library helper

`src/lib/openai.ts` centralizes client creation and a simple text generation helper.

### 3) API routes

- `POST /api/openai/test` — text generation (requires session)
  - Body JSON:
    ```json
    { "prompt": "Say hello in Russian", "temperature": 0.7 }
    ```
  - Response: `{ text: string }`

- `GET /api/openai/files` — list uploaded files
- `POST /api/openai/files` — upload a file (multipart/form-data):
  - `file`: the file
  - `purpose`: defaults to `assistants`
- `DELETE /api/openai/files/[id]` — delete a file by id

All routes require an authenticated user (NextAuth).

### 4) Quick local test

Run dev server:

```
npm run dev
```

Generate text:

```
curl -X POST http://localhost:3000/api/openai/test \
  -H "Content-Type: application/json" \
  -b "next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"prompt":"Привет, OpenAI!"}'
```

If you see connectivity errors (e.g. `Unable to reach the model provider`), check:
- `OPENAI_API_KEY` is set and valid
- No corporate proxy/firewall blocks outbound HTTPS to `api.openai.com`
- If using a custom provider, set `OPENAI_BASE_URL`

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support, email info@shapeai.co.uk or create an issue in the repository.

