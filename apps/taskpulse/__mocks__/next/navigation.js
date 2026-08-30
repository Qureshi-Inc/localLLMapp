const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  reload: jest.fn(),
};

let pathname = '/';

function usePathname() {
  return pathname;
}

function useRouter() {
  return mockRouter;
}

function useSearchParams() {
  return new URLSearchParams();
}

function useSelectedLayoutSegment() {
  return null;
}

function useSelectedLayoutSegments() {
  return [];
}

function useParams() {
  return {};
}

function usePathnames() {
  return [];
}

function useBreadcrumb() {
  return [];
}

module.exports = {
  usePathname,
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  useParams,
  usePathnames,
  useBreadcrumb,
  setPathname: (p) => { pathname = p; },
  getRouter: () => mockRouter,
};
