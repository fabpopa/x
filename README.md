# x-web

Website basics, published as individual packages.

## Elements

- [**x-gallery**](x-gallery): Gallery for images and other media.

## Scripts

- [**x-up**](x-up): Upgrade links and forms to background fetch with in-place swap to avoid full page navigation.

## Releasing

Increment the `version` field in `package.json` for one of the packages, then create a tag `[package]@v[version]` and release on GitHub. A GitHub action will trigger and publish the package specified by the tag to npm.
