import type { CardConfig, ConfigPath, TabbedCardConfig } from "./types";

export function readAt(root: any, path: ConfigPath): any {
  return path.reduce((value, key) => value?.[key], root);
}

export function replaceAt<T>(root: T, path: ConfigPath, value: unknown): T {
  if (!path.length) return structuredClone(value) as T;
  const copy = structuredClone(root);
  let parent: any = copy;
  for (let index = 0; index < path.length - 1; index++) {
    parent[path[index]] ??= typeof path[index + 1] === "number" ? [] : {};
    parent = parent[path[index]];
  }
  parent[path[path.length - 1]] = structuredClone(value);
  return copy;
}

export function defaultIndex(config: TabbedCardConfig): number {
  const index = config.options?.defaultTabIndex ?? 0;
  return Math.max(0, Math.min(Number.isInteger(index) ? index : 0, config.tabs.length - 1));
}

export type ListOperation = "copy" | "delete" | "up" | "down";

export function editList<T>(root: T, path: ConfigPath, index: number, operation: ListOperation): T {
  const list = [...readAt(root, path)];
  if (index < 0 || index >= list.length) return root;
  const parentPath = path.slice(0, -1);
  const parent = readAt(root, parentPath);
  const isTabs = path[path.length - 1] === "tabs";
  const explicitDefault = isTabs && parent.options?.defaultTabIndex !== undefined;
  const oldDefault = isTabs ? defaultIndex(parent) : 0;
  let selected = oldDefault;
  if (operation === "copy") {
    list.splice(index + 1, 0, structuredClone(list[index]));
    if (index < oldDefault) selected++;
  } else if (operation === "delete") {
    list.splice(index, 1);
    selected = oldDefault > index ? oldDefault - 1 : Math.min(oldDefault, Math.max(0, list.length - 1));
  } else {
    const target = index + (operation === "up" ? -1 : 1);
    if (target < 0 || target >= list.length) return root;
    [list[index], list[target]] = [list[target], list[index]];
    if (oldDefault === index) selected = target;
    else if (oldDefault === target) selected = index;
  }
  let result = replaceAt(root, path, list);
  if (explicitDefault) result = replaceAt(result, [...parentPath, "options", "defaultTabIndex"], selected);
  return result;
}

export function caption(card: CardConfig): string {
  const heading = card?.["title-card"]?.cards?.find((child: CardConfig) => child.subtitle || child.title);
  return heading?.subtitle || heading?.title || card?.subtitle || card?.title ||
    card?.name || card?.entity || card?.type || "Card";
}
