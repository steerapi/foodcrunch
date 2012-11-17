all:
	cd web; make
watch:
	watch -n 1 make
run:
	make
	node app.js

.PHONY: watch

