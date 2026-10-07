import { createShell } from "./core/shell.ts";
import { startRouter } from "./core/router.ts";
import { createHttpClient } from "./core/http.ts";
import { createActionLogger } from "./core/logger.ts";
import { returnTarget } from "./core/access.ts";
import { registerPages, cards, menu, initializeFeatures } from "./features/features.manifest.ts";
import type { PageServices } from "./shared/page.type.ts";

export async function composeApplication() {
  const pages = registerPages(cards);
  const services: PageServices = {
    http: await createHttpClient(),
    logger: createActionLogger(),
    navigation: {
      navigate(path) {
        navigation.navigate(path);
      },
      afterLogin() {
        navigation.navigate(
          returnTarget(pages, new URLSearchParams(location.search).get("returnTo")),
        );
      },
    },
  };
  const features = await initializeFeatures(services);
  const shell = createShell({ menu, services, session: features.session });
  startRouter({ ...shell, ...features, pages, services });
  return { ...shell, pages, services };
}
