
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Audience } from '../components/Audience';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Audience />
            </main>
            <Footer />
        </div>
    );
};
