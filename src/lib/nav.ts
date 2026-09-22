import { base } from '$app/paths';

export function appPath(route = '/') {
  if (route === '/' || route === '') return base || '/';
  const normalized = route.startsWith('/') ? route : `/${route}`;
  return `${base}${normalized}`;
}
