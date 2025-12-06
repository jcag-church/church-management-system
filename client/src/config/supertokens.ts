import SuperTokens from "supertokens-auth-react";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";

export function initSuperTokens() {
  SuperTokens.init({
    appInfo: {
      appName: "Church Management System",
      apiDomain: "http://localhost:3000",
      websiteDomain: "http://localhost:5173",
      apiBasePath: "/auth",
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
