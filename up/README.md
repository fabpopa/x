# Up

Microlibrary for actions without full page refresh. It upgrades links and forms to background fetch with in-place swap.

## Install

Add dependency:

```
npm i @fabpopa/x-up
```

Initialize the library to watch the root document for changes and upgrade elements automatically:

```
import { init } from "@fabpopa/x-up";
init();
```

Or upgrade a DOM subtree manually without watching for changes:

```
import { upgradeElements } from "@fabpopa/x-up";
upgradeElements(document.querySelector("#target"));
```

## Use

Setting one or more `data-up-` attributes on an element will make the library take over the `click` event and perform the operation in the background. The default behavior is to perform a `GET` and to swap `outerHTML`.

For example, write `data-up-target=#element` on an `<a>` to perform a `GET` to `a.href`, select the HTML for `#element` from the response and swap it into `#element` on the current page. Other attributes can modify this implicit behavior.

Similarly, `data-up-post` on an element inside a `<form>` performs a POST to the `action` URL of the form implicitly or to another URL if specified as `data-up-post=[url]`.

An empty `data-up-select` will select the entire response.

### Command attributes

- `data-up-get=[url]` Send `GET` to URL. URL optional for `<a>`.
- `data-up-post=[url]` Send `POST` to URL. URL optional. Works inside `<form>`.
- `data-up-target=[selector]` Swap target from response to target on page.
- `data-up-select=[selector]` Select different target from response.
- `data-up-inner` Change swap method to `innerHTML`.
- `data-up-history` Update URL in browser bar.
