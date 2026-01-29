import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import DemoSection from '@/components/DemoSection'
import BentoGrid from '@/components/BentoGrid'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <DemoSection />
      <BentoGrid />
      <FAQ />
      <Footer />
    </main>
  )
}
