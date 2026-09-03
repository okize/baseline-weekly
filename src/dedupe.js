export function filterSeen(raw, priorDigests) {
  const seenWeb = new Set(
    priorDigests.flatMap((d) => (d.web ?? []).map((i) => i.id)),
  );
  const seenNode = new Set(
    priorDigests.flatMap((d) => (d.node ?? []).map((i) => i.version)),
  );
  return {
    ...raw,
    web: raw.web.filter((i) => !seenWeb.has(i.id)),
    node: raw.node.filter((i) => !seenNode.has(i.version)),
  };
}
