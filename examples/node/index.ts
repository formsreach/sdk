import { FormsReach, FormsReachClientError } from "@formsreach/node";

async function main() {
  const apiKey = process.env.FORMSREACH_API_KEY?.trim();
  if (!apiKey) {
    console.error("Set FORMSREACH_API_KEY to a developer API key.");
    process.exit(1);
  }

  const fr = new FormsReach({ apiKey });

  const { items: forms } = await fr.forms.list();
  console.log(`Forms: ${forms.length}`);
  for (const f of forms) {
    console.log(`- ${f.name} (${f.id}) active=${f.isActive}`);
  }

  const formId = process.env.FORM_ID?.trim() || forms[0]?.id;
  if (!formId) {
    console.log("No forms found.");
    return;
  }

  const form = await fr.forms.get(formId);
  console.log(`\nForm detail: ${form.name} fields=${form.fields.length}`);

  const page = await fr.submissions.list(formId, { limit: 10 });
  console.log(`\nSubmissions (page): ${page.items.length}`);
  for (const s of page.items) {
    console.log(`- ${s.id} spam=${s.isSpam} at ${s.createdAt}`);
  }
  if (page.nextCursor) {
    console.log(`nextCursor: ${page.nextCursor}`);
  }

  const csv = await fr.submissions.export(formId);
  console.log(`\nCSV export length: ${csv.length} chars`);
}

main().catch((err) => {
  if (err instanceof FormsReachClientError) {
    console.error("FormsReach error:", err.formsreach);
  } else {
    console.error(err);
  }
  process.exit(1);
});
