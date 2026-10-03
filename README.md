# Bharat Bhramanam — Netlify configuration
[build]
  publish = "public"          # only this folder is public
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"    # bundles netlify/lib/* (incl. premium data) into the functions, never into the public site
