#!/bin/sh
set -eu

project_name="${DCP_PROJECT_NAME:-D Cloud}"
service_name="${DCP_SERVICE_NAME:-hello-world}"

cat >/usr/share/nginx/html/runtime-env.js <<EOF
window.__HELLO_WORLD_CONFIG__ = {
  loaded: true,
  projectName: "${project_name}",
  serviceName: "${service_name}",
  errorMessage: ""
};
EOF
