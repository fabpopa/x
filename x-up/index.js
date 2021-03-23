const handlerKey = "xUpHandler";
const instructions = ["get", "post", "target", "select", "inner", "history"];
const iAttrSelector = instructions.map((i) => `[data-up-${i}]`).join(",");

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
