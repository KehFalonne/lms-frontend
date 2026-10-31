export function sanitizeContentHtml(value: string): string {
  if (typeof DOMParser === "undefined") {
    return value.replace(/<script[\s\S]*?<\/script>/gi, "");
  }
  const document = new DOMParser().parseFromString(value, "text/html");
  document.body.querySelectorAll("div").forEach((element) => {
    if (element.querySelector("h1, h2, h3, p, ul, ol, blockquote")) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    const paragraph = document.createElement("p");
    paragraph.innerHTML = element.innerHTML;
    element.replaceWith(paragraph);
  });
  document.body.querySelectorAll("b, i").forEach((element) => {
    const replacement = document.createElement(element.tagName === "B" ? "strong" : "em");
    replacement.innerHTML = element.innerHTML;
    element.replaceWith(replacement);
  });
  const allowed = new Set([
    "P", "BR", "STRONG", "EM", "U", "H1", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE", "A",
  ]);
  document.body.querySelectorAll("*").forEach((element) => {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    Array.from(element.attributes).forEach((attribute) => {
      if (element.tagName === "A" && attribute.name === "href" && /^https?:\/\//i.test(attribute.value)) return;
      element.removeAttribute(attribute.name);
    });
  });
  return document.body.innerHTML;
}

export function highlightContentHtml(value: string, query: string): string {
  const document = new DOMParser().parseFromString(sanitizeContentHtml(value), "text/html");
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return document.body.innerHTML;

  const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(escaped, "gi");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);

  nodes.forEach((textNode) => {
    const text = textNode.nodeValue ?? "";
    if (!pattern.test(text)) {
      pattern.lastIndex = 0;
      return;
    }
    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    text.replace(pattern, (match, offset: number) => {
      fragment.append(text.slice(lastIndex, offset));
      const mark = document.createElement("mark");
      mark.textContent = match;
      fragment.append(mark);
      lastIndex = offset + match.length;
      return match;
    });
    fragment.append(text.slice(lastIndex));
    textNode.replaceWith(fragment);
  });
  return document.body.innerHTML;
}

export function countTextMatches(value: string, query: string): number {
  const text = new DOMParser()
    .parseFromString(sanitizeContentHtml(value), "text/html")
    .body.textContent ?? "";
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return 0;
  return text.match(new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"))?.length ?? 0;
}
