import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Settings className="size-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Account preferences and app configuration will be available here
          soon.
        </p>
      </div>
    </div>
  );
}
