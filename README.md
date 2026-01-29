This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Database Setup (PostgreSQL)

This project uses **PostgreSQL**.

### 1. Configure Environment
Create a `.env` file (copy from `.env.example`) and set your `DATABASE_URL` to your PostgreSQL connection string (from Vercel, Neon, or Supabase).
```env
DATABASE_URL="postgres://user:password@host.neon.tech/dbname?sslmode=require"
```

### 2. Run Migration
Use Prisma to push the schema to your database:
```bash
npx prisma db push
```

### 3. Seed Data
Populate default categories:
```bash
npx prisma db seed
```

## Deploy on Vercel
1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
4.  Deploy.

