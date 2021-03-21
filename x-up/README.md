# x-up

Perform actions without full page refresh.

Upgrades links and forms to background fetch, with an option to swap elements from the response into the current page.

## Install

```
npm i @fabpopa/x-up
```

Watch a subtree from the root element for changes and upgrade elements automatically:

```js
import { watch, unwatch } from "@fabpopa/x-up";
const root = document.body;
watch(root); // Start watching subtree from root
unwatch(root); // Stop watching
```

Or upgrade a subtree manually without watching for changes:

```js
import { upgrade, downgrade } from "@fabpopa/x-up";
const root = document.querySelector("#target");
upgrade(root); // Add functionality to elements from root
downgrade(root); // Remove functionality
```

## Use

Setting one or more `data-up-` attributes on an element will take over the `click` event and perform the operation in the background. The default behavior is to perform a `GET` and to swap `outerHTML`.

For example, write `data-up-target=#element` on an `<a>` to perform a `GET` to `a.href`, select the HTML for `#element` from the response, and swap it into `#element` on the current page. Other attributes can modify this implicit behavior.

Similarly, `data-up-post` on an element inside a `<form>` performs a `POST` to the `action` URL of the form implicitly or to another URL if specified by `data-up-post=[url]`.

## Attributes

- `data-up-get=[url]` Send `GET` to URL. URL optional for `<a>`.
- `data-up-post=[url]` Send `POST` to URL. URL optional. Works inside `<form>`.
- `data-up-target=[selector]` Swap target from response to target on page.
- `data-up-select=[selector]` Select different target from response. Empty swaps entire response.
- `data-up-inner` Change swap method to `innerHTML`.
- `data-up-history` Update URL in browser bar.

## Notes

### Cross-origin requests

Background fetches comply with CORS policy and are mostly meant for pages on the same origin.

### Browser compatibility

All modern browsers that can support `<script type=module>`.
