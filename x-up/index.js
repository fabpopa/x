const handlerKey = "xUpHandler";
const instructions = ["get", "post", "target", "select", "inner", "history"];
const iAttrSelector = instructions.map((i) => `[data-up-${i}]`).join(",");

const rootElToObserverMap = new Map();
const rootElToParentObserverMap = new Map();

const error = (msg) => {
  throw new Error(`x-up: ${msg}`);
};

const makeSwapAttr = (inner) => (inner ? "innerHTML" : "outerHTML");

const makeFetchHandler = ({
  url,
  method,
  form,
  target,
  select,
  inner,
  history,
}) => async (event) => {
  event.preventDefault();

  const response = await fetch(url, {
    method,
    body: form ? new FormData(form) : undefined,
    credentials: "same-origin", // Send cookies on older browsers
  });

  if (!response.ok) error(response.status);

  const body = await response.text();
  const dom = new DOMParser().parseFromString(body, "text/html");

  select = select || target;
  const selectEl = dom.querySelector(select);
  if (!selectEl) error(`No response element for ${select}`);
  const swapAttr = makeSwapAttr(inner);
  const targetEl = document.querySelector(target);
  if (!targetEl) error(`No target element for ${target}`);
  targetEl[swapAttr] = selectEl[swapAttr];

  if (history) window.history.replaceState({}, dom.title, url);
};

const makeGetHandler = (el, { get, target, select, inner, history }) => {
  const url = get && get !== true ? get : el.href;
  if (!url) error("No URL for GET request");
  const method = "GET";
  const opt = { url, method, target, select, inner, history };
  return makeFetchHandler(opt);
};

const makePostHandler = (el, { post, target, select, inner, history }) => {
  let formEl = el;
  while (formEl && formEl.tagName !== "FORM") formEl = formEl.parentElement;
  if (!formEl) error("No form found for POST request");

  const url = post === true ? formEl.action : post;
  if (!url) error("No URL for POST request");
  const method = "POST";
  const opt = { url, method, form: formEl, target, select, inner, history };
  return makeFetchHandler(opt);
};

const upgradeElement = (el, opt) => {
  if (el[handlerKey]) return;
  let handler;
  if (opt.get || opt.target) handler = makeGetHandler(el, opt);
  if (opt.post) handler = makePostHandler(el, opt);
  if (!handler) error("Invalid element");
  el.addEventListener("click", handler);
  el[handlerKey] = handler;
};

const downgradeElement = (el) => {
  const handler = el[handlerKey];
  if (!handler) return;
  el.removeEventListener("click", handler);
  delete el[handlerKey];
};

const readOpts = (el) => {
  const allVals = instructions.map((i) => [i, el.getAttribute(`data-up-${i}`)]);
  const setVals = allVals.filter(([_, v]) => v !== null);
  const mapTrueVals = setVals.map(([i, v]) => (v === "" ? [i, true] : [i, v]));
  return Object.fromEntries(mapTrueVals);
};

export const upgrade = (rootEl) => {
  const els = Array.from(rootEl.querySelectorAll(iAttrSelector));
  els.forEach((el) => upgradeElement(el, readOpts(el)));
};

export const downgrade = (rootEl) => {
  const els = Array.from(rootEl.querySelectorAll(iAttrSelector));
  els.forEach((el) => downgradeElement(el));
};

const handleMutation = (mutations) => {
  mutations.forEach(({ type, target }) => {
    if (type !== "childList") return;
    upgrade(target);
  });
};

const handleMaybeRootElDeletion = (mutations) => {
  mutations.forEach((m) => {
    if (m.removedNodes.length === 0) return;
    const removedNodes = Array.from(m.removedNodes);
    const delRootEls = removedNodes.filter((n) => rootElToObserverMap.has(n));
    delRootEls.forEach(unwatch);
  });
};

export const watch = (rootEl) => {
  if (rootElToObserverMap.has(rootEl)) return;
  const observer = new MutationObserver(handleMutation);
  rootElToObserverMap.set(rootEl, observer);
  observer.observe(rootEl, { subtree: true, childList: true });
  upgrade(rootEl);

  // Clean up references should any rootEl be removed
  const parentObserver = new MutationObserver(handleMaybeRootElDeletion);
  rootElToParentObserverMap.set(rootEl, parentObserver);
  parentObserver.observe(rootEl.parentNode, { childList: true });
};

export const unwatch = (rootEl) => {
  if (!rootElToObserverMap.has(rootEl)) return;
  const observer = rootElToObserverMap.get(rootEl);
  rootElToObserverMap.delete(rootEl);
  observer.disconnect();
  const parentObserver = rootElToParentObserverMap.get(rootEl);
  rootElToParentObserverMap.delete(rootEl);
  parentObserver.disconnect();
  downgrade(rootEl);
};
