COFFEE = $(shell find . -name "*.coffee" -type f)
JS = $(COFFEE:.coffee=.js)

STYL = $(shell find . -name "*.styl" -type f)
CSS = $(STYL:.styl=.css)

JADE = $(shell find . -name "*.jade" -type f)
HTML = $(JADE:.jade=.html)

all: index.html index.js $(CSS)

run:
	http-server

watch:
	watch -n 1 make

index.html: $(JADE)
	jade -p ./jade index.jade

%.css: %.styl
	stylus -I . $< --include-css

index.js: $(COFFEE)
	coffee ../scripts/coffeescript-include.coffee -I coffee index.coffee > index.tmp
	coffee -cb index.tmp
	rm index.tmp

clean:
	rm -f $(HTML) $(CSS) $(JS)

.PHONY: clean run watch