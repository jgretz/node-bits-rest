import loadRoutes from './load_routes';

// compile
const compileConfiguration = (options = {}, bitsConfig) =>
  ({
    ...options,
    ...bitsConfig,
  });

export default options =>
  ({
    loadRoutes: bitsConfig => {
      const config = compileConfiguration(options, bitsConfig);
      return loadRoutes(config);
    },
  });
