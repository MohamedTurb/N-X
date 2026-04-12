import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { AuthForm } from "../../components/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center px-4 py-16 sm:px-6">
        <div className="w-full">
          <p className="font-display text-[10px] tracking-[0.35em] text-zinc-500 sm:text-xs sm:tracking-[0.5em]">ACCESS</p>
          <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-[0.05em] sm:mt-6 sm:text-6xl">
            Register
          </h1>
          <div className="mt-10">
            <AuthForm mode="register" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}