// src/lib/api.js

export function listDeploys() {
  return Promise.resolve([]); // mock data
}

export function rollbackDeploy(id) {
  return Promise.resolve({ status: "rolled back", id });
}

export function triggerDeploy(config) {
  return Promise.resolve({ status: "deployment started", config });
}