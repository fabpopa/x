const mark = `xUp${window.btoa(Math.random() * Math.pow(10, 4)).slice(0, 4)}`;
const instructions = ["get", "post", "target", "select", "inner", "history"];
const iAttrSelector = instructions.map((i) => `[data-up-${i}]`).join(",");

let observer; // Mutation observer to detect and upgrade new elements

const error = (msg) => {
  throw new Error(`X lib: ${msg}`);
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
  if (el[mark]) return;
  el[mark] = true; // Mark upgraded elements to only process once
  let handler;
  if (opt.get || opt.target) handler = makeGetHandler(el, opt);
  if (opt.post) handler = makePostHandler(el, opt);
  if (!handler) error("Invalid element");
  el.addEventListener("click", handler);
};

const readOpts = (el) => {
  const allVals = instructions.map((i) => [i, el.getAttribute(`data-up-${i}`)]);
  const setVals = allVals.filter(([_, v]) => v !== null);
  const mapTrueVals = setVals.map(([i, v]) => (v === "" ? [i, true] : [i, v]));
  return Object.fromEntries(mapTrueVals);
};

export const upgradeElements = (rootEl) => {
  const els = Array.from(rootEl.querySelectorAll(iAttrSelector));
  els.forEach((el) => upgradeElement(el, readOpts(el)));
};

const handleMutation = (mutations) => {
  mutations.forEach(({ type, target }) => {
    if (type !== "childList") return;
    upgradeElements(target);
  });
};

export const init = () => {
  if (observer) return;
  observer = new MutationObserver(handleMutation);
  observer.observe(document.body, { subtree: true, childList: true });
  upgradeElements(document.body);
};
