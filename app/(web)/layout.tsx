import { Header } from "@/components/web/header";
import { Footer } from "@/components/web/footer";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
