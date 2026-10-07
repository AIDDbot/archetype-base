import type { PageContext } from "../../shared/page.type.ts";
import { createRecordDetail } from "../../shared/components/record.detail.ts";
import { createAccountStore } from "./users.store.ts";
import { createAccountClient } from "./users.client.ts";
import type { Account } from "./users.type.ts";

function describeAccount(account: Account) {
  return {
    title: account.name,
    subtitle: "Account",
    sections: [
      {
        heading: "Details",
        facts: [
          { label: "Name", kind: "text", value: account.name, key: "name" },
          { label: "Email", kind: "text", value: account.email, key: "email" },
          { label: "Created", kind: "date", value: account.createdAt, key: "createdAt" },
        ],
      },
    ],
    links: [],
  } as const;
}
export async function mount(context: PageContext) {
  const detail = createRecordDetail();
  detail.loading("Account", []);
  context.outlet.append(detail);
  const id = context.parameters.id;
  if (id === undefined) throw new Error("Account id parameter is missing");
  const client = createAccountClient(context.services.http);
  const state = await createAccountStore(client).load({ value: id });
  if (state.status === "loaded") return detail.show(describeAccount(state.account));
  detail.fail({
    title: "Account",
    message: state.status === "not-found" ? "Account not found" : "Account unavailable",
    links: [],
  });
}
