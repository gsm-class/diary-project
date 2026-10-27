"use client";

import { EntryForm } from "../entry-form";

import { createEntryAction } from "./actions";

export function NewEntryForm() {
  return <EntryForm action={createEntryAction} />;
}
