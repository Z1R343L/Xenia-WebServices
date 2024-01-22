FROM node:latest
EXPOSE 3600
EXPOSE 8080
COPY . .
RUN npm i
RUN npm run build
CMD [ "npm", "run", "start" ]