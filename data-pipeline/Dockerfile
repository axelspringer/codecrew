FROM node:16

# Add the data pipeline code
ADD dist /datapipeline
COPY src/sklls-cli/linux/sklls /usr/local/bin/
COPY config.js /datapipeline/config.js

# Run the data pipeline as the entrypoint
ENTRYPOINT ["node", "/datapipeline/index.js"]