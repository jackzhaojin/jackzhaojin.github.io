#!/usr/bin/env bash
# Checks the live jackzhaojin.com deployment end to end.
# Run after any push: ./scripts/check-site.sh
# Exit code is non-zero if any check fails. Needs curl; gh is optional.
#
# What it checks (see docs/site-operations.md for why each matters):
#   1. GitHub Pages build state for the current commit (skipped without gh)
#   2. Redirect chain: http/https x apex/www all end at https://www.jackzhaojin.com/
#   3. Every page serves the gtag snippet with the expected Measurement ID
#   4. Search Console verification file and meta tag are still live
#   5. robots.txt and sitemap.xml are served and the sitemap lists every page
#   6. Demo pages (design-system candidates) carry noindex and stay out of the sitemap

set -u
SITE="https://www.jackzhaojin.com"
GA_ID="G-ZVENE6BXTJ"
VERIFY_FILE="google57906613577fdd42.html"
VERIFY_META="6FfUrqzAd1GDf35t2W1QHz-2rIbSjVTKzuZwWQKJjqw"
PAGES=("/" "/writing/" "/portfolio/" "/talks/" "/certifications/")
LEGACY_PAGES=("/blogs.html" "/certifications.html")
# Published for show-and-tell only: must serve gtag, must be noindex, must not be in the sitemap.
NOINDEX_PAGES=("/design-systems/2026-09-13/" "/design-systems/2026-09-13/claude-fable-5-1/" "/design-systems/2026-09-13/astra/" "/design-systems/2026-09-13/kimi-k3/" "/design-systems/2026-09-13/google-stitch/" "/design-systems/v3/" "/design-systems/v3/templates/home.html")
fail=0
cb() { printf '%s' "$(date +%s%N)"; }   # cache-buster so Cloudflare cannot serve a stale copy
ok()  { printf '  ok   %s\n' "$1"; }
bad() { printf '  FAIL %s\n' "$1"; fail=1; }

echo "1. GitHub Pages build"
if command -v gh >/dev/null 2>&1; then
  build=$(gh api repos/jackzhaojin/jackzhaojin.github.io/pages/builds/latest --jq '"\(.status) \(.commit[0:7])"' 2>/dev/null || echo "unknown")
  head=$(git rev-parse --short=7 HEAD 2>/dev/null || echo "?")
  case "$build" in
    "built $head") ok "latest build is HEAD ($build)";;
    built*)        bad "latest build is $build but local HEAD is $head (push, or wait for the build)";;
    *)             bad "build status: $build";;
  esac
else
  echo "  skip gh not installed"
fi

echo "2. Redirect chain"
for u in "http://jackzhaojin.com/" "http://www.jackzhaojin.com/" "https://jackzhaojin.com/" "$SITE/"; do
  final=$(curl -s -o /dev/null -L -w '%{url_effective} %{http_code}' "$u")
  [ "$final" = "$SITE/ 200" ] && ok "$u -> $final" || bad "$u -> $final"
done

echo "3. Analytics tag on every page"
for p in "${PAGES[@]}" "${LEGACY_PAGES[@]}" "${NOINDEX_PAGES[@]}"; do
  n=$(curl -s "$SITE$p?cb=$(cb)" | grep -c "gtag/js?id=$GA_ID")
  [ "$n" = "1" ] && ok "$p" || bad "$p (found $n occurrences of $GA_ID)"
done

echo "4. Search Console verification"
body=$(curl -s "$SITE/$VERIFY_FILE?cb=$(cb)")
[ "$body" = "google-site-verification: $VERIFY_FILE" ] && ok "verification file" || bad "verification file body: $body"
curl -s "$SITE/?cb=$(cb)" | grep -q "google-site-verification\" content=\"$VERIFY_META\"" && ok "verification meta tag" || bad "verification meta tag missing from /"

echo "5. robots.txt and sitemap.xml"
curl -s "$SITE/robots.txt?cb=$(cb)" | grep -q "^Sitemap: $SITE/sitemap.xml" && ok "robots.txt points at sitemap" || bad "robots.txt"
sitemap=$(curl -s "$SITE/sitemap.xml?cb=$(cb)")
for p in "${PAGES[@]}"; do
  echo "$sitemap" | grep -q "<loc>$SITE$p</loc>" && ok "sitemap lists $p" || bad "sitemap missing $p"
done

echo "6. Demo pages are noindex and absent from the sitemap"
for p in "${NOINDEX_PAGES[@]}"; do
  page=$(curl -s -w '\n%{http_code}' "$SITE$p?cb=$(cb)")
  code=$(echo "$page" | tail -n1)
  [ "$code" = "200" ] && ok "$p serves 200" || bad "$p returned $code"
  echo "$page" | grep -q '<meta name="robots" content="noindex">' && ok "$p has noindex" || bad "$p missing noindex"
  echo "$sitemap" | grep -q "<loc>$SITE$p" && bad "sitemap must not list $p" || ok "$p not in sitemap"
done

echo "7. Canonical pages, legacy URLs, and discovery"
for p in "${PAGES[@]}"; do
  page=$(curl -s "$SITE$p?cb=$(cb)")
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE$p?cb=$(cb)")
  [ "$code" = "200" ] && ok "$p serves 200" || bad "$p returned $code"
  echo "$page" | grep -q "href=\"$SITE$p\"" && ok "$p canonical URL present" || bad "$p canonical missing"
  echo "$page" | grep -q 'application/ld+json' && ok "$p structured data" || bad "$p structured data missing"
  echo "$page" | grep -q '/design-systems/v3/tokens.css' && ok "$p uses v3" || bad "$p missing v3 tokens"
  echo "$page" | grep -q 'content="noindex"' && bad "$p must be indexable" || ok "$p indexable"
done
for p in "${LEGACY_PAGES[@]}"; do
  case "$p" in
    /blogs.html) destination="/writing/";;
    /certifications.html) destination="/certifications/";;
  esac
  page=$(curl -sL "$SITE$p?cb=$(cb)")
  echo "$page" | grep -q "href=\"$SITE$destination\"" && ok "$p canonical destination" || bad "$p canonical destination missing"
  echo "$sitemap" | grep -q "<loc>$SITE$p</loc>" && bad "$p must not be in sitemap" || ok "$p absent from sitemap"
done
curl -s "$SITE/llms.txt?cb=$(cb)" | grep -q '^# Jack Jin' && ok "llms.txt" || bad "llms.txt missing"
missing_code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE/v3-check-intentionally-missing?cb=$(cb)")
[ "$missing_code" = "404" ] && ok "unknown path returns 404" || bad "unknown path returned $missing_code"

echo
[ "$fail" = 0 ] && echo "All checks passed." || { echo "Some checks failed."; exit 1; }
