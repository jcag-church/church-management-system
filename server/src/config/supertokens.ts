import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import Dashboard from "supertokens-node/recipe/dashboard";
import ThirdParty from "supertokens-node/recipe/thirdparty";

export function initSuperTokens() {
  console.log("Google Client ID loaded:", !!process.env.GOOGLE_CLIENT_ID);
  console.log("Google Client Secret loaded:", !!process.env.GOOGLE_CLIENT_SECRET);
  
  supertokens.init({
    framework: "express",
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || "",
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo: {
      appName: "Church Management System",
      apiDomain: process.env.API_DOMAIN || "https://staging-connect.hows-tine.com",
      websiteDomain: process.env.WEBSITE_DOMAIN || "https://staging-connect.hows-tine.com",
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            // We will add providers here later or via dashboard
             {
              config: {
                thirdPartyId: "google",
                clients: [{
                  clientId: process.env.GOOGLE_CLIENT_ID || "",
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
                }]
              }
            },
            {
              config: {
                thirdPartyId: "github",
                clients: [{
                  clientId: process.env.GITHUB_CLIENT_ID || "",
                  clientSecret: process.env.GITHUB_CLIENT_SECRET || ""
                }]
              }
            }
          ],
        },
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              signInUp: async function (input) {
                const response = await originalImplementation.signInUp(input);

                if (response.status === "OK") {
                  const { id, emails } = response.user;
                  
                  try {
                    const { default: prisma } = await import('../lib/prisma');

                    if (!id) {
                      console.error("No user ID found in response");
                      return response;
                    }

                    const existingUser = await prisma.user.findUnique({
                      where: { id },
                    });

                    if (!existingUser) {
                      const email = emails[0];
                      const newUser = await prisma.user.create({
                        data: {
                          id,
                          email,
                          name: email.split('@')[0],
                          role: 'VISITOR',
                        },
                      });
                    }
                  } catch (err) {
                    console.error("Error syncing user to local DB:", err);
                    // We don't want to block the login if sync fails, but we should log it.
                    // Ideally, we might want to return a specific error or retry later.
                  }
                }
                return response;
              },
            };
          },
        },
      }),
      Session.init(),
      Dashboard.init(),
    ],
  });
}
