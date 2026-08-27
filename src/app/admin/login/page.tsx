import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-28">
      <h1 className="font-display text-4xl">Admin</h1>
      <p className="mt-3 text-sm text-muted">Lokaal: admin@droomop2.local / admin123</p>
      <div className="mt-8">
        <AdminLoginForm />
      </div>
    </div>
  );
}
