build:
	npm install
	npm run tsc
docker:
	make build
	docker build . -t dojoswaper/autoswaper:latest