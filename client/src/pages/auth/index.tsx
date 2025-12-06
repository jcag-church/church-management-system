import { useEffect } from "react";
import { redirectToAuth } from "supertokens-auth-react";

export default function AuthPage() {
  useEffect(() => {
    redirectToAuth();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p>Redirecting to authentication...</p>
    </div>
  );
}
