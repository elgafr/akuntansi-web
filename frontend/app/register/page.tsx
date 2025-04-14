import { RegisterForm } from "@/components/register-form";

export default function Page() {
  return (
    <div className="flex flex-col items-center min-h-svh p-6 md:p-40">
      <img
        src="/assets/image/Logo.png"
        alt="Company Logo"
        className="w-full max-w-xs mb-4 md:md-w-sm"
      />
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
