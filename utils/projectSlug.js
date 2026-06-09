import projectModel from "../models/project.js";

export function slugifyProjectName(name) {
  return String(name ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function buildUniqueProjectSlug(name, excludeId = null) {
  const base = slugifyProjectName(name) || "project";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await projectModel.findOne(query).select("_id").lean();
    if (!exists) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function backfillMissingProjectSlugs() {
  const missing = await projectModel
    .find({ $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }] })
    .select("_id name")
    .lean();

  for (const project of missing) {
    const slug = await buildUniqueProjectSlug(project.name, project._id);
    await projectModel.updateOne({ _id: project._id }, { $set: { slug } });
  }

  if (missing.length) {
    console.log(`Backfilled slugs for ${missing.length} project(s)`);
  }
}
