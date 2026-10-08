# financemanagement

## Supabase setup

The demo login remains local so the hackathon flow works without a Supabase project:

- Email: `admin@finmanage.com`
- Password: `Admin@123`

To enable persistence, copy `.env.example` to `.env.local`, add the Supabase project URL and publishable/anon key, then run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. Never put a service-role key in this frontend.

When configured, customers, loan applications, loan decisions, and payment status changes are loaded from and saved to Supabase. The policies in the included schema are intentionally open for this local demo because the login is still a client-side demo login; replace them with authenticated-user policies before production use.

This project uses React and Vite with HMR and ESLint.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
