import SuperTokens from "supertokens-auth-react";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";

export function initSuperTokens() {
  SuperTokens.init({
    appInfo: {
      appName: "Church Management System",
      apiDomain: import.meta.env.VITE_API_DOMAIN || "https://staging-connect.hows-tine.com",
      websiteDomain: import.meta.env.VITE_WEBSITE_DOMAIN || "https://staging-connect.hows-tine.com",
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            ThirdParty.Google.init(),
            ThirdParty.Github.init(),
          ],
        },
      }),
      Session.init(),
    ],
  });
}
