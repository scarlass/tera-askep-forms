DIST_DIR := dist/forms
SOURCE_DIR := forms

anc-build:
	rm -rf dist;
	pnpm dlx @tailwindcss/cli --cwd ${SOURCE_DIR}/antenatal -o "$$(pwd)/${DIST_DIR}/antenatal/index.css" -i index.css --minify;

anc-watch:
	rm -rf dist;
	pnpm dlx @tailwindcss/cli --cwd ${SOURCE_DIR}/antenatal -o "$$(pwd)/${DIST_DIR}/antenatal/index.css" -i index.css --minify -w;
