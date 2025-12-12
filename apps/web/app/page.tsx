import {
  Header,
  Hero,
  ModulesSection,
  HowItWorks,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ModulesSection />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
