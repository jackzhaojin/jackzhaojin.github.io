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

set -u
SITE="https://www.jackzhaojin.com"
GA_ID="G-ZVENE6BXTJ"
VERIFY_FILE="google57906613577fdd42.html"
VERIFY_META="6FfUrqzAd1GDf35t2W1QHz-2rIbSjVTKzuZwWQKJjqw"
PAGES=("/" "/blogs.html" "/certifications.html" "/portfolio/" "/design-systems/2026-09-13/")
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
for p in "${PAGES[@]}"; do
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

echo
[ "$fail" = 0 ] && echo "All checks passed." || { echo "Some checks failed."; exit 1; }
