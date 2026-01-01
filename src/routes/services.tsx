import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Nos Services</h1>
      <p className="mt-4 text-muted-foreground">Page en construction...</p>
    </div>
  );
}
