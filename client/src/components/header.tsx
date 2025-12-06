import { Link } from "react-router-dom";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-8 justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-heading font-bold inline-block text-xl md:text-2xl tracking-widest text-foreground">
              JCAG<span className="text-primary">CONNECT</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const { signOut } = await import("supertokens-auth-react/recipe/session");
                await signOut();
                window.location.href = "/auth";
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
