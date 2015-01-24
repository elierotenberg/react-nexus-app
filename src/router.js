import Router from 'isomorphic-router';

const router = new Router();

function route(title, description) {
  return (query, params, hash) => ({ title, description, query, params, hash });
}

router.on('/', route('Home', 'The homepage of my application'));
router.on('/about', route('About', 'Where I explain what my application does'));
router.on('/contact', route('Contact', 'You can contact us here'));
router.on('(.*)', route('Not found', 'Page not found'));

export default router;
