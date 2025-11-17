DIST_DIR := dist/forms
SOURCE_DIR := forms

PG_HOST := 192.168.0.15

anc-build:
	rm -rf dist;
	pnpm dlx @tailwindcss/cli --cwd ${SOURCE_DIR}/antenatal -o "$$(pwd)/${DIST_DIR}/antenatal/index.css" -i index.css --minify;

anc-watch:
	rm -rf dist;
	pnpm dlx @tailwindcss/cli --cwd ${SOURCE_DIR}/antenatal -o "$$(pwd)/${DIST_DIR}/antenatal/index.css" -i index.css --minify -w;


anc-dist:
	{ \
		echo "<style>"; \
		cat ${DIST_DIR}/antenatal/index.css; \
		echo ""; \
		echo "</style>"; \
		echo "<script>"; \
		cat ${SOURCE_DIR}/antenatal/index.js; \
		echo ""; \
		echo "</script>"; \
		cat ${SOURCE_DIR}/antenatal/index.html; \
	} > ${DIST_DIR}/antenatal/index.html;

# Sync Generic
anc-sync:
	make anc-dist;
	CONTENT="$$(base64 -w 0 ${DIST_DIR}/antenatal/index.html)"; \
	psql -h ${PG_HOST} -p 5432 -U terakorp -d teramedik_master -c "UPDATE askep_list SET form_data = convert_from(decode('$$CONTENT', 'base64'), 'UTF8') WHERE alid = 842;";

# Sync with Proxy
anc-sync-px:
	make anc-dist;
	CONTENT="$$(base64 -w 0 ${DIST_DIR}/antenatal/index.html)"; \
	psql -h ${PG_HOST} -p 5432 -U terakorp -d teramedik_master -c "UPDATE askep_list SET form_data = convert_from(decode('$$CONTENT', 'base64'), 'UTF8') WHERE alid = 842;";

anc-b-s:
	make anc-build;
	make anc-sync;
