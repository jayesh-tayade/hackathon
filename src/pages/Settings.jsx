import ThemeToggle from "@/components/theme/ThemeToggle";
import { User, Info, Wrench, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const technologies = [
    "React",
    "Firebase",
    "Google Gemini AI",
    "Tailwind CSS",
    "Vite",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold">
                {user?.displayName || "Anonymous User"}
              </h3>

              <p className="text-sm text-muted-foreground">
                {user?.email || "No email available"}
              </p>
            </div>
          </div>

          <Button onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

              <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Appearance
          </h2>

          <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Theme
          </span>

          <ThemeToggle />
        </div>
        </div>

      {/* About */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5" />
          <h2 className="text-xl font-semibold">About Chronos</h2>
        </div>

        <p className="leading-relaxed text-foreground">
          Chronos is an AI-powered productivity assistant that helps users
          organize tasks, predict future workload, and identify deadline risks
          using Google Gemini AI.
        </p>

        <p className="mt-4 text-sm font-medium text-muted-foreground">
          v1.0 Hackathon Edition
        </p>
      </div>

      {/* Built With */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Built With</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {technologies.map((tech) => (
            <div
              key={tech}
              className="rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

