FROM node:16.18-alpine3.15
LABEL author="leftover"
LABEL github="https://github.com/robot-bingbing/add-interview"
COPY . /add-interview
WORKDIR /add-interview
ENV PORT=12500
ENV HTTPS=false
EXPOSE 12500
RUN yarn install
CMD yarn build:server && npm run start
