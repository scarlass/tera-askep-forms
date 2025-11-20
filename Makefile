DIST_DIR := dist/forms
SOURCE_DIR := forms

PG_HOST := 192.168.0.15

anc-build:
	rm -rf dist;
	pnpm dlx @tailwindcss/cli --cwd ${SOURCE_DIR}/antenatal -o "$$(pwd)/${DIST_DIR}/antenatal/index.css" -i index.css --minify;

anc-watch:
	rm -rf dist;
	pnpm dlx @tailwindcss/cli --cwd ${SOURCE_DIR}/antenatal -o "$$(pwd)/${DIST_DIR}/antenatal/index.css" -i index.css --minify -w;
