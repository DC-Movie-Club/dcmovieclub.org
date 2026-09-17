// One-off: converts the FAQ copy from "### Question" + answer sections into
// `:::details[Question]` blocks, which the site renders as expandable rows.
//
// Dry run (prints the result, writes nothing):
//   node --experimental-strip-types --env-file=.env.local scripts/migrate-faq-to-details.ts
// Apply (saves a backup of the current content next to this script first):
//   node --experimental-strip-types --env-file=.env.local scripts/migrate-faq-to-details.ts --write

import { writeFileSync } from "node:fs";
import { getAdminDb } from "../src/lib/firebase-admin.ts";

const QUESTION_RE = /^###\s+(.+?)\s*#*\s*$/;
const HEADING_RE = /^#{1,6}\s/;

function toDetails(markdown: string) {
  const output: string[] = [];
  let question: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    if (question === null) {
      output.push(...answer);
    } else {
      const body = answer.join("\n").trim();
      const label = question.replace(/[[\]]/g, (bracket) => `\\${bracket}`);
      output.push(`:::details[${label}]\n${body}\n:::`, "");
    }
    question = null;
    answer = [];
  };

  for (const line of markdown.split("\n")) {
    const match = line.match(QUESTION_RE);
    if (match) {
      flush();
      question = match[1];
    } else if (question !== null && HEADING_RE.test(line)) {
      flush();
      answer.push(line);
    } else {
      answer.push(line);
    }
  }
  flush();

  return output.join("\n").trim() + "\n";
}

async function main() {
  const write = process.argv.includes("--write");
  const db = getAdminDb();
  const ref = db.collection("copy").doc("faq");
  const snap = await ref.get();
  const content = (snap.data()?.content as string | undefined) ?? "";

  if (!content.trim()) {
    console.log("FAQ copy is empty; nothing to migrate.");
    return;
  }
  if (content.includes(":::details")) {
    console.log("FAQ copy already uses :::details; nothing to migrate.");
    return;
  }

  const migrated = toDetails(content);
  const questions = (content.match(/^###\s/gm) ?? []).length;
  const blocks = (migrated.match(/^:::details\[/gm) ?? []).length;

  console.log(migrated);
  console.log(`--- ${questions} questions → ${blocks} details blocks`);

  if (questions !== blocks) {
    console.error("Question count doesn't match; not writing.");
    process.exit(1);
  }
  if (!write) {
    console.log("Dry run. Re-run with --write to save.");
    return;
  }

  const backup = new URL(`./faq-backup-${Date.now()}.md`, import.meta.url);
  writeFileSync(backup, content);
  console.log(`Backed up current content to ${backup.pathname}`);

  await ref.set({
    content: migrated,
    updatedAt: new Date(),
    updatedBy: null,
    updatedByName: "FAQ migration",
  });
  console.log("Saved.");
}

main();
