import type { PageContext } from "../../shared/page.type.ts";
import type { RecordCardDescription } from "../../shared/record.type.ts";
import { createRecordCard } from "../../shared/components/record.card.ts";
import { readUser } from "./auth.store.ts";
import type { PublicUser } from "./auth.type.ts";

const title = "Authentication";
const visitorLinks = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
] as const;

function describeVisitor(): RecordCardDescription {
  return {
    title,
    subtitle: "Welcome",
    state: "Signed out",
    facts: [{ label: "User", kind: "text", value: undefined }],
    links: visitorLinks,
  };
}
function describeUser(user: PublicUser): RecordCardDescription {
  return {
    title,
    state: "Signed in",
    facts: [
      { label: "User", kind: "text", value: user.name },
      { label: "Email", kind: "text", value: user.email },
    ],
    links: [{ label: `Hello, ${user.name}`, href: `/users/${user.id}` }],
  };
}
export function mount(context: PageContext) {
  const card = createRecordCard();
  const lifetime = new AbortController();
  function update() {
    if (card.dataset.mounted && !card.isConnected) return lifetime.abort();
    const user = readUser();
    card.show(user ? describeUser(user) : describeVisitor());
  }
  update();
  context.outlet.append(card);
  card.dataset.mounted = "true";
  window.addEventListener("session-changed", update, { signal: lifetime.signal });
}
