# x-gallery

Custom element to construct a gallery of images and other media.

## Use

```
<x-gallery>
  <img ...>
</x-gallery>

<script type="module" src="x-gallery.min.js"></script>
```

The element will use all available width and height and should be hosted inside a wrapper.

Page styles are recommended to prevent layout shift:

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
