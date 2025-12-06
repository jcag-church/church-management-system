import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

export default function LandingPage() {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Telephone Wire Motif (Subtle Lines) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <path d="M-100,100 Q400,300 1000,100 T2000,300" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
             <path d="M-100,150 Q400,350 1000,150 T2000,350" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
           </svg>
        </div>

        <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-white/60">
              JCAG<br />Connect
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto font-sans tracking-wide">
              SERVING AN <span className="text-primary font-bold">AWESOME GOD</span> WITH EXCELLENCE.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            {isLoggedIn ? (
              <Button size="lg" className="text-lg px-8 py-6 font-heading tracking-wisder" asChild>
                <Link to="/dashboard">ENTER DASHBOARD</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6 font-heading tracking-wider" asChild>
                  <Link to="/auth">GET STARTED</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-heading tracking-wider bg-transparent/10 backdrop-blur-sm" asChild>
                  <Link to="/auth">LEARN MORE</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} JCAG Connect by hows-tine. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
