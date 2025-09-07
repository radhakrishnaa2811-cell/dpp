#!/bin/sh
echo "window.env = {" > /usr/share/nginx/html/config.js
echo "  REACT_APP_API_URL: '$REACT_APP_API_URL'" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js