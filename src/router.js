import Router from 'isomorphic-router';

const router = new Router();

[
// patterns are matched from top to bottom.
// pattern      title         description
  ['/',         'Home',      'The homepage of my application'],
  ['/about',    'About',     'Where I explain what my application does'],
  ['/contact',  'Contact',   'You can contact us here'],
  ['(.*)',      'Not found', 'Page not found'],
].forEach(([pattern, title, description]) =>
  router.on(pattern, (query, params, hash) => ({ title, description, query, params, hash }))
);

export default router;
