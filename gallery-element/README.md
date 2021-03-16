# Gallery Element

## Use

```
<x-gallery>
  <img ...>
</x-gallery>

<script type="module" src="gallery-element.js"></script>
```

The `<x-gallery>` element will take over all available width and height and should be hosted inside a wrapper.

Fallback styles are recommended to prevent layout shift until the custom element can take over.

```
x-gallery {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
}

x-gallery img {
  flex: 0 0 100%;
}
```
